import { JSX } from "preact";
import { signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import type { SolarTimesSummary } from "../../solar";
import { useWeatherData } from "../../hooks/useWeatherData";

import { type RouteEntry, type RouteLayer } from "./constants";

interface TableViewProps {
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
  isSelectedScheduleToday: boolean;
}

interface HourGroup {
  hour: number;
  entries: RouteEntry[];
}

// Selected time signals (persisted within session, like PosterView)
const selectedTurTime = signal<string | null>(null);
const selectedReturTime = signal<string | null>(null);

function groupEntriesByHour(entries: RouteEntry[]): HourGroup[] {
  const map = new Map<number, RouteEntry[]>();

  for (const entry of entries) {
    const hour = Math.floor(entry.totalMinutes / 60);
    const group = map.get(hour);
    if (group) {
      group.push(entry);
    } else {
      map.set(hour, [entry]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([hour, hourEntries]) => ({ hour, entries: hourEntries }));
}

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "acum";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
  return `${m} min`;
}

// Minutes until a time occurs next (today if future, tomorrow if past)
function minutesUntilNext(currentMinutes: number, targetMinutes: number): number {
  if (targetMinutes > currentMinutes) return targetMinutes - currentMinutes;
  return 24 * 60 - currentMinutes + targetMinutes;
}

// Extract full station name with direction arrow prefix
function getStationHeader(direction: "tur" | "retur", label: string): string {
  // label = "Tur · Bucuresti" or "Retur · C.F.R. PROGRESUL"
  const destination = label.split(" · ")[1] ?? label;
  const prefix = direction === "tur" ? "\u2192" : "\u2190";
  // Reconstruct full direction text
  if (direction === "tur") {
    return `${prefix} Spre ${destination}`;
  }
  return `${prefix} Spre ${destination}`;
}

interface DirectionCardProps {
  routeLayer: RouteLayer;
  currentHour: number;
  currentMinutes: number;
  isSelectedScheduleToday: boolean;
  selectedTime: typeof selectedTurTime;
}

function DirectionCard({
  routeLayer,
  currentHour,
  currentMinutes,
  isSelectedScheduleToday,
  selectedTime,
}: DirectionCardProps): JSX.Element {
  const groups = groupEntriesByHour(routeLayer.entries);
  const theme = routeLayer.theme;
  const nextTime = routeLayer.nextDeparture?.time ?? null;
  const stationHeader = getStationHeader(routeLayer.direction, routeLayer.label);
  const { data: weatherData } = useWeatherData();

  const handleTimeClick = (time: string) => {
    selectedTime.value = selectedTime.value === time ? null : time;
  };

  return (
    <div
      class="flex flex-col rounded-lg border-2 bg-white overflow-hidden"
      style={{ borderColor: theme.markerSoft }}
    >
      {/* Direction header */}
      <div
        class="px-2.5 py-1.5 flex items-baseline gap-1"
        style={{ backgroundColor: theme.markerSoft }}
      >
        <span
          class="inline-block h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: theme.marker }}
        />
        <span class="font-ui text-[11px] font-bold tracking-wide" style={{ color: theme.marker }}>
          {stationHeader}
        </span>
      </div>

      {/* Hour-grouped rows */}
      <div class="flex flex-col p-1">
        {groups.map(({ hour, entries }) => {
          const isCurrentHour = isSelectedScheduleToday && hour === currentHour;

          return (
            <div
              key={hour}
              class={twMerge(
                "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1.5 py-0.5 rounded-md",
                isCurrentHour && "bg-slate-50",
              )}
            >
              {entries.map((entry) => {
                const isNext = entry.time === nextTime;
                const isPast = entry.isPast && isSelectedScheduleToday;
                const isTapped = selectedTime.value === entry.time;

                // Tapped past times: compute countdown to next day
                const tappedCountdown =
                  isTapped && isPast ? minutesUntilNext(currentMinutes, entry.totalMinutes) : null;

                return (
                  <button
                    key={entry.time}
                    type="button"
                    onClick={() => handleTimeClick(entry.time)}
                    class={twMerge(
                      "inline-flex items-center gap-1 rounded-md px-1 py-[1px] tabular-nums transition-all duration-150 cursor-pointer",
                      isNext
                        ? "font-bold"
                        : isTapped
                          ? "font-bold"
                          : isPast
                            ? "text-slate-400"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                    style={
                      isNext
                        ? { color: theme.marker, backgroundColor: theme.markerSoft }
                        : isTapped
                          ? {
                              color: "oklch(0.2795 0.0368 260.03)",
                              backgroundColor: "oklch(0.95 0.005 260)",
                            }
                          : undefined
                    }
                  >
                    <span class="font-ui text-xl">{entry.time}</span>
                    {isNext && routeLayer.nextDeparture && (
                      <span class="font-ui text-xs font-semibold leading-none opacity-80">
                        {formatCountdown(routeLayer.nextDeparture.minutesUntil)}
                      </span>
                    )}
                    {isTapped && isPast && tappedCountdown !== null && (
                      <span class="font-ui text-xs font-semibold leading-none opacity-80">
                        {formatCountdown(tappedCountdown)}
                      </span>
                    )}
                    {isTapped && !isPast && routeLayer.nextDeparture && !isNext && (
                      <span class="font-ui text-xs font-semibold leading-none opacity-80">
                        {formatCountdown(minutesUntilNext(currentMinutes, entry.totalMinutes))}
                      </span>
                    )}
                  </button>
                );
              })}
              {weatherData.value && (() => {
                const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                const temp = weatherData.value.temperatures.find((t) => t.hour === hourStr);
                if (!temp) return null;
                return (
                  <span class="ms-auto font-ui text-[11px] font-medium text-slate-400 tabular-nums">
                    {temp.temperature}°
                  </span>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TableView({
  routeLayers,
  solarTimes,
  isSelectedScheduleToday,
}: TableViewProps): JSX.Element {
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;
  const currentHour = Math.floor(solarTimes.currentMinutes / 60);

  return (
    <div class="flex w-full flex-col gap-2 px-1">
      {/* Side-by-side direction cards */}
      <div class="grid grid-cols-2 gap-2">
        <DirectionCard
          routeLayer={turLayer}
          currentHour={currentHour}
          currentMinutes={solarTimes.currentMinutes}
          isSelectedScheduleToday={isSelectedScheduleToday}
          selectedTime={selectedTurTime}
        />
        <DirectionCard
          routeLayer={returLayer}
          currentHour={currentHour}
          currentMinutes={solarTimes.currentMinutes}
          isSelectedScheduleToday={isSelectedScheduleToday}
          selectedTime={selectedReturTime}
        />
      </div>
    </div>
  );
}
