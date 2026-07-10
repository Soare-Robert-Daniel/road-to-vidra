import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const BUS_DATA_URL = "/api/busData";
const POLL_INTERVAL_MS = 15_000;

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

interface RawBusDataItem {
  id: string;
  vehicle?: {
    trip?: {
      routeId?: string;
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
  const raw: RawBusDataItem[] = await response.json();

  return raw
    .filter(
      (
        item,
      ): item is RawBusDataItem & {
        vehicle: NonNullable<RawBusDataItem["vehicle"]> & {
          trip: {
            routeId: string;
            directionId?: number;
            startTime?: string;
          };
        };
      } => item.vehicle?.trip?.routeId !== undefined,
    )
    .map((item) => ({
      id: item.id,
      label: item.vehicle.vehicle.label,
      licensePlate: item.vehicle.vehicle.licensePlate,
      latitude: item.vehicle.position.latitude,
      longitude: item.vehicle.position.longitude,
      timestamp: item.vehicle.timestamp,
      routeId: item.vehicle.trip.routeId,
      directionId: item.vehicle.trip.directionId,
      startTime: item.vehicle.trip.startTime,
    }));
}

function getCachedData(): BusPosition[] | null {
  if (!globalCache || Date.now() - globalCache.timestamp >= POLL_INTERVAL_MS) {
    return null;
  }
  return globalCache.data;
}

function setCachedData(data: BusPosition[]): void {
  globalCache = { timestamp: Date.now(), data };
}

export function useBusPositions(routeNumber: "418" | "420" | "438"): {
  buses: BusPosition[];
  loading: boolean;
  error: Error | null;
  lastUpdate: number | null;
} {
  const [buses, setBuses] = useState<BusPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    const routeIds = new Set([`PV1_${routeNumber}`, routeNumber, `"${routeNumber}"`]);

    try {
      const cachedBuses = getCachedData();
      const allBuses = cachedBuses ?? (await fetchBusData());
      if (!cachedBuses) {
        setCachedData(allBuses);
      }

      setBuses(allBuses.filter((bus) => routeIds.has(bus.routeId)));
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

    intervalRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  return { buses, loading, error, lastUpdate };
}
