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

// Route bounds for map view
const ROUTE_BOUNDS: L.LatLngBoundsExpression = [
  [44.255, 26.072], // Southwest
  [44.371, 26.198], // Northeast
];

// Direction status type
type DirectionStatus = "unknown" | "tur" | "retur";

// Bus icons with different shapes based on direction
const createBusIcon = (status: DirectionStatus) => {
  const colors = {
    unknown: "#64748b", // gray
    tur: "#22c55e", // green
    retur: "#f97316", // orange
  };

  const fill = colors[status];

  if (status === "unknown") {
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

  // Triangle/arrow shape for known directions
  const rotation = status === "tur" ? 0 : 180; // tur points up/forward, retur points down/backward
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
      (f: { properties: { route_id: string } }) =>
        targetRouteIds.includes(f.properties.route_id),
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

interface SpeedHistoryEntry {
  projectedKm: number;
  timestamp: number;
}

interface BusMotionState {
  lat: number;
  lng: number;
  projectedKm?: number;
  computedDirectionId?: number;
  speedHistory: SpeedHistoryEntry[];
}

const SPEED_HISTORY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const MIN_MOVEMENT_KM = 0.02;
const MIN_DIRECTION_SCORE = 0.15;

function normalizeRouteDirection(coords: [number, number][]): {
  canonicalCoords: [number, number][];
  totalLengthKm: number;
} {
  if (coords.length < 2) {
    return { canonicalCoords: coords, totalLengthKm: 0 };
  }

  const first = coords[0];
  const last = coords[coords.length - 1];
  const shouldReverse = first[1] > last[1];
  const canonicalCoords = shouldReverse ? [...coords].reverse() : coords;
  const totalLengthKm = turf.length(turf.lineString(canonicalCoords), {
    units: "kilometers",
  });

  return { canonicalCoords, totalLengthKm };
}

function getTangentAt(
  coords: [number, number][],
  nearestIndex: number,
): { x: number; y: number } | null {
  if (coords.length < 2) return null;

  const clampedIndex = Math.max(0, Math.min(nearestIndex, coords.length - 2));
  const from = coords[clampedIndex];
  const to = coords[clampedIndex + 1];

  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);

  if (len === 0) return null;
  return { x: dx / len, y: dy / len };
}

const MIN_SPEED_DATA_MS = 60 * 1000; // Minimum 1 minute of data for speed calculation

// Calculate average speed from history (km/h over last N minutes)
function calculateAverageSpeed(
  history: SpeedHistoryEntry[],
  now: number,
): number | null {
  if (history.length < 2) return null;

  const windowStart = now - SPEED_HISTORY_WINDOW_MS;
  const entriesInWindow = history.filter((e) => e.timestamp >= windowStart);

  if (entriesInWindow.length < 2) return null;

  const oldest = entriesInWindow[0];
  const newest = entriesInWindow[entriesInWindow.length - 1];
  const timeDeltaMs = newest.timestamp - oldest.timestamp;

  // Require at least 1 minute of data
  if (timeDeltaMs < MIN_SPEED_DATA_MS) return null;

  const distanceDelta = newest.projectedKm - oldest.projectedKm;
  const timeDeltaHours = timeDeltaMs / (1000 * 60 * 60);

  return Math.abs(distanceDelta / timeDeltaHours);
}

// Calculate ETA in minutes from distance (km) and speed (km/h)
function calculateEta(
  distanceKm: number | null,
  speedKmH: number | null,
): number | null {
  if (distanceKm === null || speedKmH === null || speedKmH <= 0) return null;
  return (distanceKm / speedKmH) * 60; // Convert hours to minutes
}

// Format ETA as human-readable string
function formatEta(minutes: number | null): string {
  if (minutes === null) return "-";
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Calculate progress towards having enough data for speed (0-1)
function calculateSpeedProgress(
  history: SpeedHistoryEntry[],
  now: number,
): number {
  if (history.length < 2) {
    // If only 1 entry, calculate time since that entry
    if (history.length === 1) {
      const elapsed = now - history[0].timestamp;
      return Math.min(1, elapsed / MIN_SPEED_DATA_MS);
    }
    return 0;
  }

  const oldest = history[0];
  const newest = history[history.length - 1];
  const timeDeltaMs = newest.timestamp - oldest.timestamp;

  return Math.min(1, timeDeltaMs / MIN_SPEED_DATA_MS);
}

// Estimation notice component
function EstimationNotice({
  buses,
}: {
  buses: Array<{ avgSpeed: number | null; speedProgress: number }>;
}): JSX.Element {
  const busesWithoutSpeed = buses.filter((b) => b.avgSpeed === null);

  if (busesWithoutSpeed.length === 0) {
    return (
      <span>
        Estimările sunt calculate pe baza ultimelor 5 minute de date colectate.
      </span>
    );
  }

  const minProgress = Math.min(
    ...busesWithoutSpeed.map((b) => b.speedProgress),
  );
  const progressPercent = Math.round(minProgress * 100);
  const remainingSeconds = Math.round((1 - minProgress) * 60);

  return (
    <span>
      <CircularProgress progress={minProgress} /> Se colectează date pentru
      calculul vitezei ({progressPercent}% complet, ~{remainingSeconds}s rămas).
      Necesită minim 1 minut de date.
    </span>
  );
}

// Circular progress indicator SVG
function CircularProgress({ progress }: { progress: number }): JSX.Element {
  const radius = 6;
  const stroke = 2;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      class="inline-block align-middle"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="rgb(203 213 225)"
        stroke-width={stroke}
      />
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="rgb(71 85 105)"
        stroke-width={stroke}
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        stroke-linecap="round"
      />
    </svg>
  );
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
    setDirectionEstablished,
  } = useBusPositions(busNumber);

  // Track previous bus states to compute direction if missing
  const prevBusStatesRef = useRef<Record<string, BusMotionState>>({});

  // Augment buses with direction from movement projection and remaining distance
  const busesWithDistance = useMemo(() => {
    const now = Date.now();
    const nextStates: Record<string, BusMotionState> = {};

    const augmentedBuses = buses.map((bus) => {
      let distance: number | null = null;
      let finalDirectionId = bus.directionId;
      let projectedKm: number | undefined;

      if (routeFeatures.length > 0) {
        try {
          const referenceFeature = routeFeatures[0];
          const rawCoords = referenceFeature?.geometry?.coordinates as
            | [number, number][]
            | undefined;
          if (rawCoords && rawCoords.length >= 2) {
            const { canonicalCoords, totalLengthKm } =
              normalizeRouteDirection(rawCoords);
            const routeLine = turf.lineString(canonicalCoords);
            const busPoint = turf.point([bus.longitude, bus.latitude]);
            const snapped = turf.nearestPointOnLine(routeLine, busPoint);
            projectedKm = (snapped.properties.location as number) ?? undefined;

            const nearestIndex = (snapped.properties.index as number) ?? 0;
            const tangent = getTangentAt(canonicalCoords, nearestIndex);
            const prevState = prevBusStatesRef.current[bus.id];

            if (prevState && tangent) {
              const prevPoint = turf.point([prevState.lng, prevState.lat]);
              const movedKm = turf.distance(prevPoint, busPoint, {
                units: "kilometers",
              });

              if (movedKm >= MIN_MOVEMENT_KM) {
                const vx = bus.longitude - prevState.lng;
                const vy = bus.latitude - prevState.lat;
                const vLen = Math.hypot(vx, vy);

                if (vLen > 0) {
                  const directionScore =
                    (vx / vLen) * tangent.x + (vy / vLen) * tangent.y;
                  if (directionScore > MIN_DIRECTION_SCORE) {
                    finalDirectionId = 0;
                  } else if (directionScore < -MIN_DIRECTION_SCORE) {
                    finalDirectionId = 1;
                  } else {
                    finalDirectionId =
                      prevState.computedDirectionId ?? finalDirectionId;
                  }
                }
              } else {
                finalDirectionId =
                  prevState.computedDirectionId ?? finalDirectionId;
              }
            }

            if (projectedKm !== undefined && totalLengthKm > 0) {
              if (finalDirectionId === 0) {
                distance = Math.max(0, totalLengthKm - projectedKm);
              } else if (finalDirectionId === 1) {
                distance = Math.max(0, projectedKm);
              }
            }
          }
        } catch (e) {
          console.error("Error calculating distance/direction:", e);
        }
      }

      // Get previous state and update speed history
      const prevState = prevBusStatesRef.current[bus.id];
      const prevHistory = prevState?.speedHistory ?? [];

      // Add new entry if we have valid projectedKm
      let newHistory = prevHistory;
      if (projectedKm !== undefined) {
        const entry: SpeedHistoryEntry = {
          projectedKm,
          timestamp: now,
        };
        // Keep only entries within the window
        const windowStart = now - SPEED_HISTORY_WINDOW_MS;
        newHistory = [
          ...prevHistory.filter((e) => e.timestamp >= windowStart),
          entry,
        ];
      }

      // Calculate average speed from history
      const avgSpeed = calculateAverageSpeed(newHistory, now);
      const speedProgress = calculateSpeedProgress(newHistory, now);

      // Save state for next poll
      nextStates[bus.id] = {
        lat: bus.latitude,
        lng: bus.longitude,
        projectedKm,
        computedDirectionId: finalDirectionId,
        speedHistory: newHistory,
      };

      return {
        ...bus,
        directionId: finalDirectionId,
        distance,
        avgSpeed,
        speedProgress,
      };
    });

    prevBusStatesRef.current = nextStates;

    // Check if all buses have established directions (0 or 1)
    const allDirectionsEstablished =
      augmentedBuses.length > 0 &&
      augmentedBuses.every(
        (bus) => bus.directionId === 0 || bus.directionId === 1,
      );

    setDirectionEstablished(allDirectionsEstablished);

    return augmentedBuses;
  }, [buses, routeFeatures, setDirectionEstablished]);

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
          (f: { properties: { route_id: string } }) =>
            f.properties.route_id === routeId,
        );

        if (routeFeatures.length === 0) {
          throw new Error(`Route ${busNumber} not found`);
        }

        setRouteFeatures(routeFeatures);
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
            L.polyline(coords, { color, weight: 4, opacity: 0.8 }).addTo(
              routeLayerRef.current!,
            );
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
        setRouteError(
          err instanceof Error ? err.message : "Failed to load route",
        );
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
      const status: DirectionStatus =
        bus.directionId === 0
          ? "tur"
          : bus.directionId === 1
            ? "retur"
            : "unknown";
      const icon = createBusIcon(status);
      const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(
        markersLayerRef.current!,
      );

      const direction =
        bus.directionId === 0
          ? "Tur"
          : bus.directionId === 1
            ? "Retur"
            : "Necunoscut";

      const time = new Date(bus.timestamp * 1000).toLocaleTimeString("ro-RO");

      const distanceText =
        bus.distance !== null
          ? `<br><strong>Distanță rămasă:</strong> ${bus.distance.toFixed(1)} km`
          : "";

      const startTimeStr = bus.startTime
        ? `<br><strong>Plecare:</strong> ${bus.startTime}`
        : "";

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
      <div
        ref={mapRef}
        class="w-full h-[400px] rounded-lg border border-slate-200"
      />

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
            <svg width="12" height="12" viewBox="0 0 28 28">
              <polygon points="14,2 26,24 2,24" fill="#22c55e" />
            </svg>
            Tur
          </span>
          <span class="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 28 28">
              <polygon points="14,26 2,4 26,4" fill="#f97316" />
            </svg>
            Retur
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-slate-500 animate-pulse" />
            Necunoscut
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
                  <th class="px-3 py-1.5 font-medium">Autobuz</th>
                  <th class="px-3 py-1.5 font-medium">Direcție</th>
                  <th class="px-3 py-1.5 font-medium">Distanță Rămasă</th>
                  <th class="px-3 py-1.5 font-medium">Viteză Medie</th>
                  <th class="px-3 py-1.5 font-medium">
                    <span class="inline-flex items-center gap-1">
                      ETA
                      <span
                        class="cursor-help text-amber-500"
                        title="Estimare bazată pe viteza medie. Poate diferi semnificativ de realitate din cauza traficului, stațiilor și altor factori."
                      >
                        ⚠
                      </span>
                    </span>
                  </th>
                  <th class="px-3 py-1.5 font-medium">Actualizat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {busesWithDistance.map((bus) => (
                  <tr key={bus.id} class="hover:bg-slate-50 transition-colors">
                    <td class="px-3 py-1">
                      <div class="font-medium text-slate-900">{bus.label}</div>
                      <div class="text-xs text-slate-500">
                        {bus.licensePlate}
                      </div>
                    </td>
                    <td class="px-3 py-1">
                      <span
                        class={twMerge(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
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
                    <td class="px-3 py-1">
                      {bus.distance !== null ? (
                        <span class="font-mono">
                          {bus.distance.toFixed(1)} km
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td class="px-3 py-1">
                      {bus.avgSpeed !== null ? (
                        <span class="font-mono">
                          {Math.round(bus.avgSpeed)} km/h
                        </span>
                      ) : (
                        <CircularProgress progress={bus.speedProgress} />
                      )}
                    </td>
                    <td class="px-3 py-1">
                      {bus.avgSpeed !== null ? (
                        formatEta(calculateEta(bus.distance, bus.avgSpeed))
                      ) : (
                        <CircularProgress progress={bus.speedProgress} />
                      )}
                    </td>
                    <td class="px-3 py-1 text-slate-500">
                      {new Date(bus.timestamp * 1000).toLocaleTimeString(
                        "ro-RO",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Estimation notice */}
          <div class="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
            <EstimationNotice buses={busesWithDistance} />
          </div>
        </div>
      )}
    </div>
  );
}
