import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { minutesToTimeLabel, type SolarTimesSummary } from "../../solar";
import type { PosterSection, RouteEntry, RouteLayer } from "./constants";

// Compact countdown format: hh:mm (e.g., "02:30" for 2h 30m)
function formatCountdown(minutes: number): string | null {
  if (minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Get urgency color based on minutes until departure
function getUrgencyColor(minutes: number, routeColor: string): string {
  if (minutes < 5) return "#dc2626"; // red-600
  if (minutes < 30) return "#ea580c"; // orange-600
  return routeColor;
}

// Calculate minutes until next occurrence of this hour (regardless of program type)
function getMinutesUntilHour(timeStr: string, currentMinutes: number): number {
  const [hour, minute] = timeStr.split(":").map(Number);
  const totalMinutes = hour * 60 + minute;
  const diff = totalMinutes - currentMinutes;
  // If already past today, next occurrence is tomorrow
  return diff > 0 ? diff : diff + 1440;
}

interface PosterSectionCardProps {
  section: PosterSection;
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
  selectedTurHour: Signal<string | null>;
  selectedReturHour: Signal<string | null>;
  onHourSelect: (direction: "tur" | "retur", time: string) => void;
}

function DepartureTime({
  entry,
  isNext,
  markerColor,
  selectedMinutesUntil,
  onSelect,
}: {
  entry: RouteEntry;
  isNext: boolean;
  markerColor: string;
  selectedMinutesUntil: number | null;
  onSelect: () => void;
}): JSX.Element {
  // Only show badge for manually selected hours, not for next departure
  const badgeText = selectedMinutesUntil !== null ? formatCountdown(selectedMinutesUntil) : null;
  const showBadge = badgeText !== null;

  // Get urgency color for countdown text
  const countdownColor = selectedMinutesUntil !== null ? getUrgencyColor(selectedMinutesUntil, markerColor) : markerColor;

  // Time text styles based on state
  const timeClass = isNext
    ? "font-display text-base font-black tabular-nums tracking-tight sm:text-lg"
    : "font-display text-base font-bold tabular-nums tracking-tight sm:text-lg";

  const timeColor = entry.isPast ? "var(--color-past-time)" : markerColor;

  return (
    <div
      class={twMerge("flex flex-col items-start min-w-0 cursor-pointer")}
      onClick={onSelect}
    >
      <span class={timeClass} style={{ color: timeColor }}>
        {entry.time}
      </span>
      <span
        class={twMerge(
          "font-ui min-w-0 px-0.5 py-0 text-xs font-semibold tabular-nums transition-opacity overflow-hidden text-ellipsis whitespace-nowrap",
          !showBadge && "opacity-0 pointer-events-none h-0",
          showBadge && "h-[1.25rem]",
        )}
        style={showBadge ? { color: countdownColor, lineHeight: "inherit" } : {}}
      >
        {badgeText}
      </span>
    </div>
  );
}

function DepartureColumn({
  entries,
  routeLayer,
  selectedHour,
  currentMinutes,
  onHourSelect,
}: {
  entries: RouteEntry[];
  routeLayer: RouteLayer;
  selectedHour: string | null;
  currentMinutes: number;
  onHourSelect: (time: string) => void;
}): JSX.Element {
  return (
    <div class="flex flex-col gap-0.5">
      {entries.length === 0 ? (
        <span class="font-ui text-xs text-slate-400 italic">Fara curse</span>
      ) : (
        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
          {entries.map((entry) => {
            const isNext =
              routeLayer.nextDeparture !== null && entry.time === routeLayer.nextDeparture.time;
            const isSelected = selectedHour === entry.time;

            // Calculate minutes until next occurrence of this hour
            const selectedMinutesUntil = isSelected
              ? getMinutesUntilHour(entry.time, currentMinutes)
              : null;

            return (
              <DepartureTime
                key={entry.time}
                entry={entry}
                isNext={isNext}
                markerColor={routeLayer.theme.marker}
                selectedMinutesUntil={selectedMinutesUntil}
                onSelect={() => onHourSelect(entry.time)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PosterSectionCard({
  section,
  routeLayers,
  solarTimes,
  selectedTurHour,
  selectedReturHour,
  onHourSelect,
}: PosterSectionCardProps): JSX.Element {
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;

  const isEmpty = section.turEntries.length === 0 && section.returEntries.length === 0;

  // Check if sunrise/sunset fall within this section
  const sunriseInSection =
    solarTimes.sunriseMinutes >= section.startMinutes && solarTimes.sunriseMinutes < section.endMinutes;
  const sunsetInSection =
    solarTimes.sunsetMinutes >= section.startMinutes && solarTimes.sunsetMinutes < section.endMinutes;

  return (
    <div
      class="rounded-2xl border border-slate-200/60 px-3 py-1 sm:px-4 sm:py-2"
      style={{ backgroundColor: section.bgColor }}
    >
      {/* Section header */}
      <div class="mb-2 flex items-baseline gap-2">
        <h3
          class="font-display text-xl font-bold tracking-tight"
          style={{ color: section.titleColor }}
        >
          {section.label}
        </h3>
        <span class="font-ui text-xs font-medium tracking-wide" style={{ color: "var(--color-time-range)" }}>
          {section.hourRange}
        </span>
        {(sunriseInSection || sunsetInSection) && (
          <span class="ml-auto flex items-baseline gap-3">
            {sunriseInSection && (
              <span class="font-ui text-xs font-medium" style={{ color: "var(--color-sunrise)" }}>
                ☀ Rasarit {minutesToTimeLabel(solarTimes.sunriseMinutes)}
              </span>
            )}
            {sunsetInSection && (
              <span class="font-ui text-xs font-medium" style={{ color: "var(--color-sunset)" }}>
                ☽ Apus {minutesToTimeLabel(solarTimes.sunsetMinutes)}
              </span>
            )}
          </span>
        )}
      </div>

      {isEmpty ? (
        <p class="font-ui py-3 text-center text-sm text-slate-400 italic">Fara curse</p>
      ) : (
        <div class="grid grid-cols-2 gap-3">
          <DepartureColumn
            entries={section.turEntries}
            routeLayer={turLayer}
            selectedHour={selectedTurHour.value}
            currentMinutes={solarTimes.currentMinutes}
            onHourSelect={(time) => onHourSelect("tur", time)}
          />
          <DepartureColumn
            entries={section.returEntries}
            routeLayer={returLayer}
            selectedHour={selectedReturHour.value}
            currentMinutes={solarTimes.currentMinutes}
            onHourSelect={(time) => onHourSelect("retur", time)}
          />
        </div>
      )}
    </div>
  );
}
