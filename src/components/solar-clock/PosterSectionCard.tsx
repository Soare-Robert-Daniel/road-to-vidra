import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { formatTimeDifference } from "../../utils";
import { minutesToTimeLabel, type SolarTimesSummary } from "../../solar";
import type { PosterSection, RouteEntry, RouteLayer } from "./constants";

interface PosterSectionCardProps {
  section: PosterSection;
  routeLayers: RouteLayer[];
  currentMinutes: number;
  isSelectedScheduleToday: boolean;
  solarTimes: SolarTimesSummary;
  selectedTurHour: Signal<string | null>;
  selectedReturHour: Signal<string | null>;
  onHourSelect: (direction: "tur" | "retur", time: string, isPast: boolean) => void;
}

function DepartureTime({
  entry,
  isNext,
  nextMinutesUntil,
  markerColor,
  isSelected,
  selectedMinutesUntil,
  onSelect,
}: {
  entry: RouteEntry;
  isNext: boolean;
  nextMinutesUntil: number | null;
  markerColor: string;
  isSelected: boolean;
  selectedMinutesUntil: number | null;
  onSelect: () => void;
}): JSX.Element {
  if (isNext) {
    return (
      <div class="flex flex-col">
        <span
          class="font-display text-base font-black tabular-nums tracking-tight sm:text-lg"
          style={{ color: markerColor }}
        >
          {entry.time}
        </span>
        <span
          class="font-ui w-fit rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: markerColor }}
        >
          {nextMinutesUntil !== null && nextMinutesUntil <= 0
            ? "acum"
            : `in ${formatTimeDifference(nextMinutesUntil ?? 0)}`}
        </span>
      </div>
    );
  }

  // Selected hour (outlined badge style)
  if (isSelected) {
    return (
      <div class="flex flex-col cursor-pointer" onClick={onSelect}>
        <span
          class="font-display text-base font-bold tabular-nums tracking-tight sm:text-lg"
          style={{ color: markerColor }}
        >
          {entry.time}
        </span>
        <span
          class="font-ui w-fit rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            borderColor: markerColor,
            color: markerColor,
            backgroundColor: "transparent",
          }}
        >
          {selectedMinutesUntil !== null && selectedMinutesUntil <= 0
            ? "acum"
            : `in ${formatTimeDifference(selectedMinutesUntil ?? 0)}`}
        </span>
      </div>
    );
  }

  // Regular future hour (clickable)
  if (!entry.isPast) {
    return (
      <span
        class="font-display text-base font-bold tabular-nums tracking-tight sm:text-lg cursor-pointer hover:opacity-70 transition-opacity"
        onClick={onSelect}
      >
        {entry.time}
      </span>
    );
  }

  // Past hour (not clickable)
  return (
    <span
      class={twMerge(
        "font-display text-base tabular-nums tracking-tight sm:text-lg",
        "font-medium line-through",
      )}
      style={{ color: "var(--color-past-time)" }}
    >
      {entry.time}
    </span>
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
  onHourSelect: (time: string, isPast: boolean) => void;
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
        <div class="flex flex-wrap gap-x-3 gap-y-0.5">
          {entries.map((entry) => {
            const isNext =
              routeLayer.nextDeparture !== null && entry.time === routeLayer.nextDeparture.time;
            const isSelected = selectedHour === entry.time;

            // Calculate minutes until for selected hour
            const selectedMinutesUntil = isSelected
              ? entry.totalMinutes - currentMinutes
              : null;

            return (
              <DepartureTime
                key={entry.time}
                entry={entry}
                isNext={isNext}
                nextMinutesUntil={isNext ? routeLayer.nextDeparture!.minutesUntil : null}
                markerColor={routeLayer.theme.marker}
                isSelected={isSelected}
                selectedMinutesUntil={selectedMinutesUntil}
                onSelect={() => onHourSelect(entry.time, entry.isPast)}
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
  isSelectedScheduleToday,
  solarTimes,
  selectedTurHour,
  selectedReturHour,
  onHourSelect,
}: PosterSectionCardProps): JSX.Element {
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;

  const isEmpty = section.turEntries.length === 0 && section.returEntries.length === 0;

  const isCurrentSection = section.containsNow && isSelectedScheduleToday;

  // Check if sunrise/sunset fall within this section
  const sunriseInSection =
    solarTimes.sunriseMinutes >= section.startMinutes && solarTimes.sunriseMinutes < section.endMinutes;
  const sunsetInSection =
    solarTimes.sunsetMinutes >= section.startMinutes && solarTimes.sunsetMinutes < section.endMinutes;

  return (
    <div
      class="rounded-2xl border border-slate-200/60 px-3 py-2.5 sm:px-4 sm:py-3"
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
        {isCurrentSection && (
          <span class="font-ui rounded-full bg-slate-900/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            acum
          </span>
        )}
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
            onHourSelect={(time, isPast) => onHourSelect("tur", time, isPast)}
          />
          <DepartureColumn
            entries={section.returEntries}
            routeLayer={returLayer}
            selectedHour={selectedReturHour.value}
            currentMinutes={solarTimes.currentMinutes}
            onHourSelect={(time, isPast) => onHourSelect("retur", time, isPast)}
          />
        </div>
      )}
    </div>
  );
}
