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
  nextMinutesUntil,
  markerColor,
  selectedMinutesUntil,
  onSelect,
}: {
  entry: RouteEntry;
  isNext: boolean;
  nextMinutesUntil: number | null;
  markerColor: string;
  selectedMinutesUntil: number | null;
  onSelect: () => void;
}): JSX.Element {
  // Determine badge content and styles
  const minutesUntil = isNext ? nextMinutesUntil : selectedMinutesUntil;
  const badgeText = formatCountdown(minutesUntil ?? 0);
  const showBadge = badgeText !== null;

  // Badge styles based on state
  const badgeStyles = isNext
    ? { backgroundColor: markerColor, color: "white" }
    : { borderColor: markerColor, color: markerColor, backgroundColor: "transparent" };

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
          "font-ui min-w-0 rounded px-0.5 py-0 text-xs font-semibold tabular-nums transition-opacity overflow-hidden text-ellipsis whitespace-nowrap",
          isNext ? "" : "border",
          !showBadge && "opacity-0 pointer-events-none h-0",
          showBadge && "h-[1.25rem]",
        )}
        style={showBadge ? { ...badgeStyles, lineHeight: "inherit" } : { borderColor: "transparent" }}
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
  const directionArrow = routeLayer.direction === "tur" ? "→" : "←";

  return (
    <div class="flex flex-col gap-0.5">
      <div
        class={twMerge(
          "mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
          routeLayer.theme.legendText,
        )}
      >
        <span class="h-2 w-2 rounded-full" style={{ backgroundColor: routeLayer.theme.marker }} />
        <span class="truncate">
          {directionArrow} {routeLayer.label}
        </span>
      </div>
      {entries.length === 0 ? (
        <span class="font-ui text-xs text-slate-400 italic">Fara curse</span>
      ) : (
        <div class="grid grid-cols-3 gap-x-2 gap-y-1">
          {entries.map((entry) => {
            const isNext =
              routeLayer.nextDeparture !== null && entry.time === routeLayer.nextDeparture.time;
            const isSelected = selectedHour === entry.time;

            // Calculate minutes until for selected hour (next day if past)
            const selectedMinutesUntil = isSelected
              ? entry.isPast
                ? entry.totalMinutes + 1440 - currentMinutes // Add 24h for next day
                : entry.totalMinutes - currentMinutes
              : null;

            return (
              <DepartureTime
                key={entry.time}
                entry={entry}
                isNext={isNext}
                nextMinutesUntil={isNext ? routeLayer.nextDeparture!.minutesUntil : null}
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
