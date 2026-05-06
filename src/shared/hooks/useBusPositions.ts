import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const BUS_API_BASE = "/api/v1/bus";
const POLL_INTERVAL_MS = 15_000;

export type BusDirection = "outbound" | "inbound" | "stationary" | "unknown";

export interface BusPosition {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  routeId: string;
  direction: BusDirection;
  directionComputed: boolean;
  remainingDistanceKm: number | null;
  avgSpeedKmH: number | null;
  speedProgress: number;
  etaMinutes: number | null;
}

interface RawEnrichedBus {
  id: string;
  label?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  routeId: string;
  direction: BusDirection;
  directionComputed: boolean;
  projectedKm: number | null;
  remainingDistanceKm: number | null;
  avgSpeedKmH: number | null;
  speedProgress: number;
  etaMinutes: number | null;
}

interface RawEnrichedResponse {
  buses: RawEnrichedBus[];
  fetchedAt: string;
}

async function fetchBusData(routeNumber: string): Promise<BusPosition[]> {
  const response = await fetch(`${BUS_API_BASE}/${routeNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bus data: ${response.status}`);
  }
  const raw: RawEnrichedResponse = await response.json();

  return raw.buses.map((bus) => ({
    id: bus.id,
    label: bus.label ?? bus.id.replace(/^PV1_/, ""),
    latitude: bus.latitude,
    longitude: bus.longitude,
    timestamp: Date.parse(bus.timestamp),
    routeId: bus.routeId,
    direction: bus.direction,
    directionComputed: bus.directionComputed,
    remainingDistanceKm: bus.remainingDistanceKm,
    avgSpeedKmH: bus.avgSpeedKmH,
    speedProgress: bus.speedProgress,
    etaMinutes: bus.etaMinutes,
  }));
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
    try {
      const data = await fetchBusData(routeNumber);
      setBuses(data);
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
