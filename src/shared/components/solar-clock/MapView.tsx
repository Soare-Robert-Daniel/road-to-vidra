import { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { twMerge } from "tailwind-merge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

import { useBusPositions, type BusPosition } from "../../hooks/useBusPositions";
import { BusDataTable, MapLegend, LoadingOverlay, ErrorOverlay, NoBusesOverlay } from "./map";
import { ShareButtons } from "../ui/ShareButtons";

const ROUTE_GEOJSON_URL = "/data/layers/routes_iun2024.geojson";

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

type BusDirection = "outbound" | "inbound" | "unknown";

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
  unknown: "Necunoscut",
};

// Bus icons with different shapes based on direction
const createBusIcon = (direction: BusDirection) => {
  const colors: Record<BusDirection, string> = {
    unknown: "#64748b", // gray
    outbound: "#22c55e", // green
    inbound: "#f97316", // orange
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
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isCacheMissingRoutes(geojson: { features?: RouteFeature[] }): boolean {
  const cachedRouteIds = new Set(geojson.features?.map((feature) => feature.properties.route_id));
  return Object.values(ROUTE_IDS).some((routeId) => !cachedRouteIds.has(routeId));
}

async function fetchRouteGeoJSON(): Promise<{ features: RouteFeature[] }> {
  const now = Date.now();
  const expiresStr = localStorage.getItem(CACHE_EXPIRATION_KEY);
  const expires = expiresStr ? parseInt(expiresStr, 10) : 0;

  try {
    if (now < expires) {
      const cachedData = localStorage.getItem(CACHE_DATA_KEY);
      if (cachedData) {
        const geojson = JSON.parse(cachedData) as { features?: RouteFeature[] };
        if (!isCacheMissingRoutes(geojson)) {
          return geojson as { features: RouteFeature[] };
        }
        localStorage.removeItem(CACHE_DATA_KEY);
        localStorage.removeItem(CACHE_EXPIRATION_KEY);
      }
    }

    const response = await fetch(ROUTE_GEOJSON_URL);
    if (!response.ok) throw new Error("Failed to fetch route data");
    const fullGeojson = (await response.json()) as { features: RouteFeature[] };
    const routeIds = new Set(Object.values(ROUTE_IDS));
    const geojson = {
      ...fullGeojson,
      features: fullGeojson.features.filter((feature) => routeIds.has(feature.properties.route_id)),
    };

    localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(geojson));
    localStorage.setItem(CACHE_EXPIRATION_KEY, (now + CACHE_TTL_MS).toString());

    return geojson;
  } catch (error) {
    // Fallback if localStorage or parsing fails
    console.warn("Local cache failed, falling back to network", error);
    const response = await fetch(ROUTE_GEOJSON_URL);
    if (!response.ok) throw new Error("Failed to fetch route data");
    return (await response.json()) as { features: RouteFeature[] };
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

interface RouteFeature {
  properties: { route_id: string };
  geometry: RouteGeometry;
}

interface SpeedHistoryEntry {
  projectedKm: number;
  timestamp: number;
}

interface BusMotionState {
  latitude: number;
  longitude: number;
  direction: BusDirection;
  speedHistory: SpeedHistoryEntry[];
}

interface ComputedBusPosition extends BusPosition {
  direction: BusDirection;
  directionComputed: boolean;
  remainingDistanceKm: number | null;
  avgSpeedKmH: number | null;
  speedProgress: number;
  etaMinutes: number | null;
}

const SPEED_HISTORY_WINDOW_MS = 5 * 60 * 1000;
const MIN_SPEED_DATA_MS = 60 * 1000;
const MIN_MOVEMENT_KM = 0.02;
const MIN_DIRECTION_SCORE = 0.15;

function directionFromId(directionId: number | undefined): BusDirection {
  if (directionId === 0) return "outbound";
  if (directionId === 1) return "inbound";
  return "unknown";
}

function normalizeRouteDirection(coords: [number, number][]): {
  canonicalCoords: [number, number][];
  totalLengthKm: number;
} {
  if (coords.length < 2) {
    return { canonicalCoords: coords, totalLengthKm: 0 };
  }

  const shouldReverse = coords[0][1] > coords[coords.length - 1][1];
  const canonicalCoords = shouldReverse ? [...coords].reverse() : coords;
  const totalLengthKm = turf.length(turf.lineString(canonicalCoords), { units: "kilometers" });

  return { canonicalCoords, totalLengthKm };
}

function getTangentAt(
  coords: [number, number][],
  nearestIndex: number,
): { x: number; y: number } | null {
  if (coords.length < 2) return null;

  const from = coords[Math.max(0, Math.min(nearestIndex, coords.length - 2))];
  const to = coords[Math.max(0, Math.min(nearestIndex + 1, coords.length - 1))];
  const x = to[0] - from[0];
  const y = to[1] - from[1];
  const length = Math.hypot(x, y);

  return length === 0 ? null : { x: x / length, y: y / length };
}

function calculateAverageSpeed(history: SpeedHistoryEntry[], now: number): number | null {
  const entriesInWindow = history.filter(
    (entry) => entry.timestamp >= now - SPEED_HISTORY_WINDOW_MS,
  );
  if (entriesInWindow.length < 2) return null;

  const oldest = entriesInWindow[0];
  const newest = entriesInWindow[entriesInWindow.length - 1];
  const elapsedMs = newest.timestamp - oldest.timestamp;
  if (elapsedMs < MIN_SPEED_DATA_MS) return null;

  return Math.abs((newest.projectedKm - oldest.projectedKm) / (elapsedMs / 3_600_000));
}

function calculateSpeedProgress(history: SpeedHistoryEntry[], now: number): number {
  if (history.length === 0) return 0;
  return Math.min(1, (now - history[0].timestamp) / MIN_SPEED_DATA_MS);
}

export function MapView({ busNumber, className }: MapViewProps): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeFeatures, setRouteFeatures] = useState<RouteFeature[]>([]);

  const {
    buses,
    loading: busesLoading,
    error: busesError,
    lastUpdate,
  } = useBusPositions(busNumber);
  const previousBusStatesRef = useRef<Record<string, BusMotionState>>({});

  const busesWithComputedData = useMemo<ComputedBusPosition[]>(() => {
    const now = Date.now();
    const nextBusStates: Record<string, BusMotionState> = {};

    const computedBuses = buses.map((bus) => {
      let direction = directionFromId(bus.directionId);
      let directionComputed = direction !== "unknown";
      let projectedKm: number | null = null;
      let remainingDistanceKm: number | null = null;

      const referenceRoute = routeFeatures[0];
      if (referenceRoute) {
        try {
          const { canonicalCoords, totalLengthKm } = normalizeRouteDirection(
            referenceRoute.geometry.coordinates,
          );
          const routeLine = turf.lineString(canonicalCoords);
          const busPoint = turf.point([bus.longitude, bus.latitude]);
          const snapped = turf.nearestPointOnLine(routeLine, busPoint);
          projectedKm = (snapped.properties.location as number) ?? null;

          const previousState = previousBusStatesRef.current[bus.id];
          const tangent = getTangentAt(
            canonicalCoords,
            (snapped.properties.index as number | undefined) ?? 0,
          );
          if (previousState && tangent) {
            const previousPoint = turf.point([previousState.longitude, previousState.latitude]);
            const movedKm = turf.distance(previousPoint, busPoint, { units: "kilometers" });

            if (movedKm >= MIN_MOVEMENT_KM) {
              const x = bus.longitude - previousState.longitude;
              const y = bus.latitude - previousState.latitude;
              const movementLength = Math.hypot(x, y);
              if (movementLength > 0) {
                const directionScore =
                  (x / movementLength) * tangent.x + (y / movementLength) * tangent.y;
                if (directionScore > MIN_DIRECTION_SCORE) {
                  direction = "outbound";
                  directionComputed = true;
                } else if (directionScore < -MIN_DIRECTION_SCORE) {
                  direction = "inbound";
                  directionComputed = true;
                } else if (previousState.direction !== "unknown") {
                  direction = previousState.direction;
                  directionComputed = true;
                }
              }
            } else if (previousState.direction !== "unknown") {
              direction = previousState.direction;
              directionComputed = true;
            }
          }

          if (projectedKm !== null && totalLengthKm > 0) {
            if (direction === "outbound") {
              remainingDistanceKm = Math.max(0, totalLengthKm - projectedKm);
            } else if (direction === "inbound") {
              remainingDistanceKm = Math.max(0, projectedKm);
            }
          }
        } catch (error) {
          console.error("Failed to calculate bus route metrics", error);
        }
      }

      const previousHistory = previousBusStatesRef.current[bus.id]?.speedHistory ?? [];
      const speedHistory =
        projectedKm === null
          ? previousHistory
          : [
              ...previousHistory.filter(
                (entry) => entry.timestamp >= now - SPEED_HISTORY_WINDOW_MS,
              ),
              { projectedKm, timestamp: now },
            ];
      const avgSpeedKmH = calculateAverageSpeed(speedHistory, now);

      nextBusStates[bus.id] = {
        latitude: bus.latitude,
        longitude: bus.longitude,
        direction,
        speedHistory,
      };

      return {
        ...bus,
        direction,
        directionComputed,
        remainingDistanceKm,
        avgSpeedKmH,
        speedProgress: calculateSpeedProgress(speedHistory, now),
        etaMinutes:
          remainingDistanceKm === null || avgSpeedKmH === null || avgSpeedKmH <= 0
            ? null
            : (remainingDistanceKm / avgSpeedKmH) * 60,
      };
    });

    previousBusStatesRef.current = nextBusStates;
    return computedBuses;
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
        const matchingRouteFeatures: RouteFeature[] = geojson.features.filter(
          (feature: RouteFeature) => feature.properties.route_id === routeId,
        );

        if (matchingRouteFeatures.length === 0) {
          throw new Error(`Route ${busNumber} not found`);
        }

        setRouteFeatures(matchingRouteFeatures);
        routeLayerRef.current?.clearLayers();

        // Add route polylines
        matchingRouteFeatures.forEach((feature, idx: number) => {
          const coords: [number, number][] = feature.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
          );
          const color = idx === 0 ? "#3b82f6" : "#ef4444"; // Blue for first segment, red for return
          L.polyline(coords, { color, weight: 4, opacity: 0.8 }).addTo(routeLayerRef.current!);
        });

        // Fit bounds to route
        const allCoords: [number, number][] = matchingRouteFeatures.flatMap((feature) =>
          feature.geometry.coordinates.map(
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

    busesWithComputedData.forEach((bus) => {
      const icon = createBusIcon(bus.direction);
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(
        markersLayerRef.current!,
      );

      const directionLabel = DIRECTION_LABEL_RO[bus.direction];
      const time = new Date(bus.timestamp * 1000).toLocaleTimeString("ro-RO");

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
  }, [busesWithComputedData]);

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
      <BusDataTable buses={busesWithComputedData} />
      <ShareButtons />
    </div>
  );
}
