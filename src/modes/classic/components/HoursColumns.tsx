import { JSX } from "preact";
import { signal } from "@preact/signals";
import { busScheduleData } from "../../../shared/utils/config";
import { timeToMinutes } from "../../../shared/utils/utils";
import { useCurrentTime } from "../../../shared/hooks/useCurrentTime";

interface HoursColumnsProps {
  busNumber: string;
  useWeekendSchedule: boolean;
}

function groupByHour(times: string[]): Map<number, string[]> {
  const groups = new Map<number, string[]>();
  for (const time of times) {
    const [h] = time.split(":");
    const hour = parseInt(h, 10);
    const existing = groups.get(hour);
    if (existing) {
      existing.push(time);
    } else {
      groups.set(hour, [time]);
    }
  }
  return groups;
}

const selectedTime = signal<string | null>(null);

function getMinutesUntil(currentMinutes: number, targetTime: string): number {
  const target = timeToMinutes(targetTime);
  if (target >= currentMinutes) return target - currentMinutes;
  return target + 24 * 60 - currentMinutes;
}

function formatCountdown(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const timePart = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  if (minutes >= 24 * 60) return `mâine ${timePart}`;
  return `în ${timePart}`;
}

export function HoursColumns({ busNumber, useWeekendSchedule }: HoursColumnsProps): JSX.Element {
  const busData = busScheduleData.bus[busNumber];
  const currentTimeSignal = useCurrentTime();
  const now = new Date(currentTimeSignal.value);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!busData) {
    return <div class="p-2">No data for bus {busNumber}</div>;
  }

  const turStation = busData.tur.station.replace(/\s+din\s+.+$/, "");
  const returStation = busData.retur.station.replace(/\s+din\s+.+$/, "");

  const turHours = useWeekendSchedule ? busData.tur.weekendHours : busData.tur.workingHours;
  const returHours = useWeekendSchedule ? busData.retur.weekendHours : busData.retur.workingHours;

  const turGroups = groupByHour(turHours);
  const returGroups = groupByHour(returHours);

  const allHours = Array.from(new Set([...turGroups.keys(), ...returGroups.keys()])).sort(
    (a, b) => a - b,
  );

  const isPast = (time: string) => timeToMinutes(time) < currentMinutes;

  const nextTurTime = turHours.find((t) => !isPast(t)) ?? null;
  const nextReturTime = returHours.find((t) => !isPast(t)) ?? null;

  const handleTimeClick = (time: string) => {
    selectedTime.value = selectedTime.value === time ? null : time;
  };

  return (
    <div class="p-2 flex">
      <div class="flex-1 border-r border-slate-300 pr-4">
        <div class="text-sm font-bold font-display text-center mb-1">{turStation}</div>
        <div class="flex flex-col gap-0.5">
          {allHours.map((hour) => {
            const turTimes = turGroups.get(hour) ?? [];
            return (
              <div key={hour} class="flex flex-wrap gap-x-2 tabular-nums text-[21px] justify-end">
                {turTimes.length === 0 ? (
                  <span class="text-gray-400">-</span>
                ) : (
                  turTimes.map((t) => {
                    const past = isPast(t);
                    const isNext = t === nextTurTime;
                    const isTapped = selectedTime.value === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        class={`cursor-pointer ${past ? "text-gray-400" : ""} ${isNext && !isTapped ? "underline decoration-indigo-500 font-bold" : ""}`}
                        onClick={() => handleTimeClick(t)}
                      >
                        {t}
                        {isTapped && (
                          <span class="text-base font-bold ml-1 text-violet-500">
                            {formatCountdown(getMinutesUntil(currentMinutes, t))}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div class="flex-1 pl-4">
        <div class="text-sm font-bold font-display text-center mb-1">{returStation}</div>
        <div class="flex flex-col gap-0.5">
          {allHours.map((hour) => {
            const returTimes = returGroups.get(hour) ?? [];
            return (
              <div key={hour} class="flex flex-wrap gap-x-2 tabular-nums text-[21px] justify-start">
                {returTimes.length === 0 ? (
                  <span class="text-gray-400">-</span>
                ) : (
                  returTimes.map((t) => {
                    const past = isPast(t);
                    const isNext = t === nextReturTime;
                    const isTapped = selectedTime.value === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        class={`cursor-pointer ${past ? "text-gray-400" : ""} ${isNext && !isTapped ? "underline decoration-emerald-500 font-bold" : ""}`}
                        onClick={() => handleTimeClick(t)}
                      >
                        {t}
                        {isTapped && (
                          <span class="text-base font-bold ml-1 text-violet-500">
                            {formatCountdown(getMinutesUntil(currentMinutes, t))}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
