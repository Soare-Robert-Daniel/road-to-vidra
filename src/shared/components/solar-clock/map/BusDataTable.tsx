import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import type { BusDirection, BusPosition } from "../../../hooks/useBusPositions";

interface BusDataTableProps {
  buses: BusPosition[];
}

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

function formatEta(minutes: number | null): string {
  if (minutes === null) return "-";
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function EstimationNotice({
  buses,
}: {
  buses: Array<{ avgSpeedKmH: number | null; speedProgress: number }>;
}): JSX.Element {
  const busesWithoutSpeed = buses.filter((b) => b.avgSpeedKmH === null);

  if (busesWithoutSpeed.length === 0) {
    return <span>Estimările sunt calculate pe baza ultimelor 5 minute de date colectate.</span>;
  }

  const minProgress = Math.min(...busesWithoutSpeed.map((b) => b.speedProgress));
  const progressPercent = Math.round(minProgress * 100);
  const remainingSeconds = Math.round((1 - minProgress) * 60);

  return (
    <span>
      <CircularProgress progress={minProgress} /> Se colectează date pentru calculul vitezei (
      {progressPercent}% complet, ~{remainingSeconds}s rămas). Necesită minim 1 minut de date.
    </span>
  );
}

const DIRECTION_BADGE_CLASS: Record<BusDirection, string> = {
  outbound: "bg-green-100 text-green-700",
  inbound: "bg-orange-100 text-orange-700",
  stationary: "bg-sky-100 text-sky-700",
  unknown: "bg-slate-100 text-slate-700",
};

const DIRECTION_BADGE_LABEL: Record<BusDirection, string> = {
  outbound: "Tur",
  inbound: "Retur",
  stationary: "Staționat",
  unknown: "Necunoscut",
};

function DirectionBadge({ direction }: { direction: BusDirection }) {
  return (
    <span
      class={twMerge(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        DIRECTION_BADGE_CLASS[direction],
      )}
    >
      {DIRECTION_BADGE_LABEL[direction]}
    </span>
  );
}

function BusDataRow({ bus }: { bus: BusPosition }) {
  return (
    <tr key={bus.id} class="hover:bg-slate-50 transition-colors">
      <td class="px-3 py-1">
        <div class="font-medium text-slate-900">{bus.label}</div>
      </td>
      <td class="px-3 py-1">
        <DirectionBadge direction={bus.direction} />
      </td>
      <td class="px-3 py-1">
        {bus.remainingDistanceKm !== null ? (
          <span class="font-mono">{bus.remainingDistanceKm.toFixed(1)} km</span>
        ) : (
          "-"
        )}
      </td>
      <td class="px-3 py-1">
        {bus.avgSpeedKmH !== null ? (
          <span class="font-mono">{Math.round(bus.avgSpeedKmH)} km/h</span>
        ) : (
          <CircularProgress progress={bus.speedProgress} />
        )}
      </td>
      <td class="px-3 py-1">
        {bus.etaMinutes !== null ? (
          formatEta(bus.etaMinutes)
        ) : (
          <CircularProgress progress={bus.speedProgress} />
        )}
      </td>
      <td class="px-3 py-1 text-slate-500">
        {new Date(bus.timestamp).toLocaleTimeString("ro-RO")}
      </td>
    </tr>
  );
}

export function BusDataTable({ buses }: BusDataTableProps): JSX.Element | null {
  if (buses.length === 0) return null;

  return (
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
            {buses.map((bus) => (
              <BusDataRow key={bus.id} bus={bus} />
            ))}
          </tbody>
        </table>
      </div>
      <div class="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
        <EstimationNotice buses={buses} />
      </div>
    </div>
  );
}
