import { JSX } from "preact";
import { useEffect, useRef, useState, useMemo } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

import { useBusPositions } from "../../hooks/useBusPositions";

const ROUTE_GEOJSON_URL = "/data/layers/routes_iun2024.geojson";

// Route ID mapping
const ROUTE_IDS: Record<"420" | "438", string> = {
  "420": "PV1_420",
  "438": "PV1_438",
};

// Route bounds covering Vidra → Bucharest
const ROUTE_BOUNDS: L.LatLngBoundsExpression = [
  [44.25, 26.0], // Southwest (Vidra area)
  [44.45, 26.2], // Northeast (Bucharest area)
];

// Bus icon (smaller, colored)
const createBusIcon = (color: string) =>
  L.divIcon({
    className: "bus-marker",
    html: `<div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
    ">B</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const CACHE_DATA_KEY = "vidra-routes-data-v1";
const CACHE_EXPIRATION_KEY = "vidra-routes-cache-expires";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

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
    const fullGeojson = await response.json();

    // Extract ONLY the routes we care about to save space
    const targetRouteIds = Object.values(ROUTE_IDS);
    const filteredFeatures = fullGeojson.features.filter(
      (f: { properties: { route_id: string } }) => targetRouteIds.includes(f.properties.route_id),
    );

    const slimGeojson = {
      type: "FeatureCollection",
      features: filteredFeatures,
    };

    localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(slimGeojson));
    localStorage.setItem(CACHE_EXPIRATION_KEY, (now + CACHE_TTL_MS).toString());

    return slimGeojson;
  } catch (error) {
    // Fallback if localStorage or parsing fails
    console.warn("Local cache failed, falling back to network", error);
    const response = await fetch(ROUTE_GEOJSON_URL);
    if (!response.ok) throw new Error("Failed to fetch route data");
    return await response.json();
  }
}

interface MapViewProps {
  busNumber: "420" | "438";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [routeFeatures, setRouteFeatures] = useState<any[]>([]);

  const {
    buses,
    loading: busesLoading,
    error: busesError,
    lastUpdate,
  } = useBusPositions(busNumber);

  // Augment buses with calculated distance
  const busesWithDistance = useMemo(() => {
    return buses.map((bus) => {
      let distance: number | null = null;
      if (routeFeatures.length > 0 && bus.directionId !== undefined) {
        try {
          const featureIdx = bus.directionId === 0 ? 0 : Math.min(1, routeFeatures.length - 1);
          const feature = routeFeatures[featureIdx];

          if (feature && feature.geometry && feature.geometry.coordinates) {
            const coords = feature.geometry.coordinates;
            const line = turf.lineString(coords);
            const busPoint = turf.point([bus.longitude, bus.latitude]);

            const snapped = turf.nearestPointOnLine(line, busPoint);
            const endPoint = turf.point(coords[coords.length - 1]);

            const sliced = turf.lineSlice(snapped, endPoint, line);
            distance = turf.length(sliced, { units: "kilometers" });
          }
        } catch (e) {
          console.error("Error calculating distance:", e);
        }
      }
      return { ...bus, distance };
    });
  }, [buses, routeFeatures]);

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

        setRouteFeatures(routeFeatures);
        routeLayerRef.current?.clearLayers();

        // Add route polylines
        routeFeatures.forEach(
          (feature: { properties: { route_id: string }; geometry: RouteGeometry }, idx: number) => {
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
          leafletMapRef.current?.fitBounds(L.latLngBounds(allCoords), { padding: [20, 20] });
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

    busesWithDistance.forEach((bus) => {
      const icon = createBusIcon(
        bus.directionId === 0 ? "#22c55e" : bus.directionId === 1 ? "#f97316" : "#64748b", // gray for unknown
      );
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(
        markersLayerRef.current!,
      );

      const direction =
        bus.directionId === 0 ? "Tur" : bus.directionId === 1 ? "Retur" : "Necunoscut";

      const time = new Date(bus.timestamp * 1000).toLocaleTimeString("ro-RO");

      const distanceText =
        bus.distance !== null
          ? `<br><strong>Distanță rămasă:</strong> ${bus.distance.toFixed(1)} km`
          : "";

      const startTimeStr = bus.startTime ? `<br><strong>Plecare:</strong> ${bus.startTime}` : "";

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 120px;">
          <strong>Autobuz ${bus.label}</strong><br>
          <span style="color: #666;">${bus.licensePlate}</span><br>
          <hr style="margin: 4px 0; border-color: #eee;">
          <strong>Direcție:</strong> ${direction}${startTimeStr}<br>
          <strong>Ultima poziție:</strong> ${time}
          ${distanceText}
        </div>
      `);
    });
  }, [busesWithDistance]);

  const formatLastUpdate = (timestamp: number | null): string => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString("ro-RO");
  };

  return (
    <div className={twMerge("relative w-full", className)}>
      <div ref={mapRef} class="w-full h-[400px] rounded-lg border border-slate-200" />

      {/* Status overlay */}
      {(routeLoading || busesLoading) && (
        <div class="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
          <div class="text-sm text-slate-600">Se incarca...</div>
        </div>
      )}

      {/* Error display */}
      {(routeError || busesError) && (
        <div class="absolute top-2 left-2 right-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {routeError || busesError?.message}
        </div>
      )}

      {/* No buses message */}
      {!busesLoading && buses.length === 0 && !busesError && (
        <div class="absolute top-2 left-2 right-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800">
          Nu exista autobuze pe ruta {busNumber} in acest moment.
        </div>
      )}

      {/* Legend and update time */}
      <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-green-500" />
            Tur
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-orange-500" />
            Retur
          </span>
        </div>
        <span>Ultima actualizare: {formatLastUpdate(lastUpdate)}</span>
      </div>

      {/* Bus Data Table */}
      {busesWithDistance.length > 0 && (
        <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Autobuz</th>
                  <th class="px-4 py-3 font-medium">Direcție</th>
                  <th class="px-4 py-3 font-medium">Distanță</th>
                  <th class="px-4 py-3 font-medium">Actualizat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {busesWithDistance.map((bus) => (
                  <tr key={bus.id} class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="font-medium text-slate-900">{bus.label}</div>
                      <div class="text-xs text-slate-500">{bus.licensePlate}</div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class={twMerge(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          bus.directionId === 0
                            ? "bg-green-100 text-green-700"
                            : bus.directionId === 1
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {bus.directionId === 0
                          ? "Tur"
                          : bus.directionId === 1
                            ? "Retur"
                            : "Necunoscut"}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      {bus.distance !== null ? (
                        <span class="font-mono">{bus.distance.toFixed(1)} km</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td class="px-4 py-3 text-slate-500">
                      {new Date(bus.timestamp * 1000).toLocaleTimeString("ro-RO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
