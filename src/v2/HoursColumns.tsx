import { JSX } from "preact";
import { busScheduleData } from "../config";

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

export function HoursColumns({ busNumber, useWeekendSchedule }: HoursColumnsProps): JSX.Element {
  const busData = busScheduleData.bus[busNumber];

  if (!busData) {
    return <div class="p-2">No data for bus {busNumber}</div>;
  }

  const turHours = useWeekendSchedule ? busData.tur.weekendHours : busData.tur.workingHours;
  const returHours = useWeekendSchedule ? busData.retur.weekendHours : busData.retur.workingHours;

  const turGroups = groupByHour(turHours);
  const returGroups = groupByHour(returHours);

  const allHours = Array.from(new Set([...turGroups.keys(), ...returGroups.keys()])).sort(
    (a, b) => a - b,
  );

  return (
    <div class="p-2">
      <div class="grid grid-cols-2 gap-4 mb-1">
        <div class="text-sm font-bold">Tur hours</div>
        <div class="text-sm font-bold">Retur hours</div>
      </div>
      <div class="flex flex-col gap-0.5">
        {allHours.map((hour) => {
          const turTimes = turGroups.get(hour) ?? [];
          const returTimes = returGroups.get(hour) ?? [];
          return (
            <div key={hour} class="grid grid-cols-2 gap-4">
              <div class="flex flex-wrap gap-x-2 tabular-nums text-base">
                {turTimes.length === 0 ? (
                  <span class="text-gray-400">-</span>
                ) : (
                  turTimes.map((t) => <span key={t}>{t}</span>)
                )}
              </div>
              <div class="flex flex-wrap gap-x-2 tabular-nums text-base">
                {returTimes.length === 0 ? (
                  <span class="text-gray-400">-</span>
                ) : (
                  returTimes.map((t) => <span key={t}>{t}</span>)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
