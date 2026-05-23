import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useBusPositions, type BusDirection } from "../../hooks/useBusPositions";
import { BusDataTable, MapLegend, LoadingOverlay, ErrorOverlay, NoBusesOverlay } from "./map";
import { ShareButtons } from "../ui/ShareButtons";

const ROUTE_GEOJSON_URL = "/api/v1/routes/geojson";

// Route ID mapping
const ROUTE_IDS: Record<"418" | "420" | "438", string> = {
  "418": "PV1_418",
  "420": "PV1_420",
  "438": "PV1_438",
};

// Route bounds for map view
const ROUTE_BOUNDS: L.LatLngBoundsExpression = [
  [44.255, 26.072], // Southwest
  [44.371, 26.198], // Northeast
];

function formatEta(minutes: number | null): string {
  if (minutes === null) return "-";
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

const DIRECTION_LABEL_RO: Record<BusDirection, string> = {
  outbound: "Tur",
  inbound: "Retur",
  stationary: "Staționat",
  unknown: "Necunoscut",
};

// Bus icons with different shapes based on direction
const createBusIcon = (direction: BusDirection) => {
  const colors: Record<BusDirection, string> = {
    unknown: "#64748b", // gray
    outbound: "#22c55e", // green
    inbound: "#f97316", // orange
    stationary: "#0ea5e9", // sky blue
  };

  const fill = colors[direction];

  if (direction === "unknown") {
    // Pulsing circle with spinner for unknown direction
    return L.divIcon({
      className: "bus-marker",
      html: `
        <div style="
          position: relative;
          width: 28px;
          height: 28px;
        ">
          <div style="
            position: absolute;
            inset: 0;
            background: ${fill};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            animation: pulse 1.5s ease-in-out infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            width: 12px;
            height: 12px;
            margin: -6px 0 0 -6px;
            border: 2px solid transparent;
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  if (direction === "stationary") {
    return L.divIcon({
      className: "bus-marker",
      html: `
        <svg width="28" height="28" viewBox="0 0 28 28">
          <rect
            x="4" y="4" width="20" height="20" rx="2"
            fill="${fill}"
            stroke="white"
            stroke-width="2"
            style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"
          />
        </svg>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  // Triangle/arrow shape for moving directions
  const rotation = direction === "outbound" ? 0 : 180;
  return L.divIcon({
    className: "bus-marker",
    html: `
      <svg width="28" height="28" viewBox="0 0 28 28" style="transform: rotate(${rotation}deg);">
        <polygon
          points="14,2 26,24 2,24"
          fill="${fill}"
          stroke="white"
          stroke-width="2"
          style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"
        />
      </svg>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const CACHE_DATA_KEY = "vidra-routes-data-v2";
const CACHE_EXPIRATION_KEY = "vidra-routes-cache-expires";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day, matching server refresh cadence

async function fetchRouteGeoJSON() {
  const now = Date.now();
  const expiresStr = localStorage.getItem(CACHE_EXPIRATION_KEY);
  const expires = expiresStr ? parseInt(expiresStr, 10) : 0;

  try {
    if (now < expires) {
      const cachedData = localStorage.getItem(CACHE_DATA_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    const response = await fetch(ROUTE_GEOJSON_URL);
    if (!response.ok) throw new Error("Failed to fetch route data");
    const geojson = await response.json();

    localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(geojson));
    localStorage.setItem(CACHE_EXPIRATION_KEY, (now + CACHE_TTL_MS).toString());

    return geojson;
  } catch (error) {
    // Fallback if localStorage or parsing fails
    console.warn("Local cache failed, falling back to network", error);
    const response = await fetch(ROUTE_GEOJSON_URL);
    if (!response.ok) throw new Error("Failed to fetch route data");
    return await response.json();
  }
}

interface MapViewProps {
  busNumber: "418" | "420" | "438";
  className?: string;
}

interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export function MapView({ busNumber, className }: MapViewProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);

  const { buses, loading: busesLoading, error: busesError, lastUpdate } = useBusPositions(
    busNumber,
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [44.35, 26.1],
      zoom: 12,
      maxBounds: ROUTE_BOUNDS,
      maxBoundsViscosity: 0.5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Load route geometry
  useEffect(() => {
    if (!leafletMapRef.current || !routeLayerRef.current) return;

    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        const geojson = await fetchRouteGeoJSON();

        const routeId = ROUTE_IDS[busNumber];
        const routeFeatures = geojson.features.filter(
          (f: { properties: { route_id: string } }) => f.properties.route_id === routeId,
        );

        if (routeFeatures.length === 0) {
          throw new Error(`Route ${busNumber} not found`);
        }

        routeLayerRef.current?.clearLayers();

        // Add route polylines
        routeFeatures.forEach(
          (
            feature: {
              properties: { route_id: string };
              geometry: RouteGeometry;
            },
            idx: number,
          ) => {
            const coords: [number, number][] = feature.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
            );
            const color = idx === 0 ? "#3b82f6" : "#ef4444"; // Blue for first segment, red for return
            L.polyline(coords, { color, weight: 4, opacity: 0.8 }).addTo(routeLayerRef.current!);
          },
        );

        // Fit bounds to route
        const allCoords: [number, number][] = routeFeatures.flatMap(
          (f: { geometry: RouteGeometry }) =>
            f.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
            ),
        );
        if (allCoords.length > 0) {
          leafletMapRef.current?.fitBounds(L.latLngBounds(allCoords));
        }

        setRouteError(null);
      } catch (err) {
        setRouteError(err instanceof Error ? err.message : "Failed to load route");
      } finally {
        setRouteLoading(false);
      }
    };

    loadRoute();
  }, [busNumber]);

  // Update bus markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    buses.forEach((bus) => {
      const icon = createBusIcon(bus.direction);
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(
        markersLayerRef.current!,
      );

      const directionLabel = DIRECTION_LABEL_RO[bus.direction];
      const time = new Date(bus.timestamp).toLocaleTimeString("ro-RO");

      const distanceText =
        bus.remainingDistanceKm !== null
          ? `<br><strong>Distanță rămasă:</strong> ${bus.remainingDistanceKm.toFixed(1)} km`
          : "";

      const speedText =
        bus.avgSpeedKmH !== null
          ? `<br><strong>Viteză medie:</strong> ${Math.round(bus.avgSpeedKmH)} km/h`
          : "";

      const etaText =
        bus.etaMinutes !== null
          ? `<br><strong>Estimare sosire:</strong> ${formatEta(bus.etaMinutes)}`
          : "";

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <strong>Autobuz ${bus.label}</strong>
          <hr style="margin: 4px 0; border-color: #eee;">
          <strong>Direcție:</strong> ${directionLabel}<br>
          <strong>Ultima poziție:</strong> ${time}
          ${distanceText}
          ${speedText}
          ${etaText}
        </div>
      `);
    });
  }, [buses]);

  const isLoading = routeLoading || busesLoading;
  const displayError = routeError ?? busesError?.message ?? null;

  return (
    <div className={twMerge("relative w-full", className)}>
      <div ref={mapRef} class="w-full h-[400px] rounded-lg border border-slate-200" />

      <LoadingOverlay visible={isLoading} />
      <ErrorOverlay error={displayError} />
      <NoBusesOverlay
        visible={!busesLoading && buses.length === 0 && !busesError}
        busNumber={busNumber}
      />

      <MapLegend lastUpdate={lastUpdate} />
      <BusDataTable buses={buses} />
      <ShareButtons />
    </div>
  );
}
