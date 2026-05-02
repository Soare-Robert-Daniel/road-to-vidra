import { JSX } from "preact";

interface MapLegendProps {
  lastUpdate: number | null;
}

function formatLastUpdate(timestamp: number | null): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString("ro-RO");
}

export function MapLegend({ lastUpdate }: MapLegendProps): JSX.Element {
  return (
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
  );
}
