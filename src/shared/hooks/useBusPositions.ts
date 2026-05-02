import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const BUS_DATA_URL = "/api/busData";
const CACHE_TTL_MS = 30_000; // 30 seconds (normal interval)
const INITIAL_INTERVAL_MS = 15_000; // 15 seconds (when direction unknown)

export interface BusPosition {
  id: string;
  label: string;
  licensePlate: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  routeId: string;
  directionId?: number;
  startTime?: string;
}

interface BusDataCache {
  timestamp: number;
  data: BusPosition[];
}

let globalCache: BusDataCache | null = null;

async function fetchBusData(): Promise<BusPosition[]> {
  const response = await fetch(BUS_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch bus data: ${response.status}`);
  }
  const raw = await response.json();

  return raw
    .filter((item: { vehicle?: { trip?: { routeId?: string } } }) => item.vehicle?.trip?.routeId)
    .map(
      (item: {
        id: string;
        vehicle: {
          trip: {
            routeId: string;
            directionId?: number;
            startTime?: string;
          };
          vehicle: {
            id: string;
            label: string;
            licensePlate: string;
          };
          position: {
            latitude: number;
            longitude: number;
          };
          timestamp: number;
        };
      }) => ({
        id: item.id,
        label: item.vehicle.vehicle.label,
        licensePlate: item.vehicle.vehicle.licensePlate,
        latitude: item.vehicle.position.latitude,
        longitude: item.vehicle.position.longitude,
        timestamp: item.vehicle.timestamp,
        routeId: item.vehicle.trip.routeId,
        directionId: item.vehicle.trip.directionId,
        startTime: item.vehicle.trip.startTime,
      }),
    );
}

function getCachedData(): BusPosition[] | null {
  if (!globalCache) return null;
  const now = Date.now();
  if (now - globalCache.timestamp < CACHE_TTL_MS) {
    return globalCache.data;
  }
  return null;
}

function setCache(data: BusPosition[]): void {
  globalCache = {
    timestamp: Date.now(),
    data,
  };
}

export function useBusPositions(routeNumber: "418" | "420" | "438"): {
  buses: BusPosition[];
  loading: boolean;
  error: Error | null;
  lastUpdate: number | null;
  setDirectionEstablished: (established: boolean) => void;
} {
  const [buses, setBuses] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [directionEstablished, setDirectionEstablished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    // Try both PV1_ prefix and plain route number for STB/PV1 routes
    const routeIds = [`PV1_${routeNumber}`, routeNumber, `"${routeNumber}"`];

    try {
      const cached = getCachedData();
      let allBuses: BusPosition[];

      if (cached) {
        allBuses = cached;
      } else {
        allBuses = await fetchBusData();
        setCache(allBuses);
      }

      const filtered = allBuses.filter((bus) => routeIds.includes(bus.routeId));
      // Debug: log total buses and filtered count
      console.log(
        `[useBusPositions] Total buses: ${allBuses.length}, Filtered for ${routeNumber}: ${filtered.length}`,
      );
      if (filtered.length === 0) {
        // Show available route IDs for debugging
        const availableRouteIds = [...new Set(allBuses.map((b) => b.routeId))].sort();
        console.log(
          `[useBusPositions] Available routeIds: ${availableRouteIds.slice(0, 30).join(", ")}...`,
        );
        // Check for partial matches
        const partialMatches = availableRouteIds.filter((id) => id.includes(routeNumber));
        if (partialMatches.length > 0) {
          console.log(
            `[useBusPositions] Partial matches for ${routeNumber}: ${partialMatches.join(", ")}`,
          );
        }
      }
      setBuses(filtered);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [routeNumber]);

  useEffect(() => {
    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Use 15s interval when direction not established, 30s when established
    const intervalMs = directionEstablished ? CACHE_TTL_MS : INITIAL_INTERVAL_MS;

    intervalRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, intervalMs);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, directionEstablished]);

  return { buses, loading, error, lastUpdate, setDirectionEstablished };
}
