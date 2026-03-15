import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { formatTimeDifference } from "../../utils";
import type { PosterSection, RouteEntry, RouteLayer } from "./constants";

interface PosterSectionCardProps {
  section: PosterSection;
  routeLayers: RouteLayer[];
  currentMinutes: number;
  isSelectedScheduleToday: boolean;
}

function DepartureTime({
  entry,
  isNext,
  nextMinutesUntil,
  markerColor,
}: {
  entry: RouteEntry;
  isNext: boolean;
  nextMinutesUntil: number | null;
  markerColor: string;
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

  return (
    <span
      class={twMerge(
        "font-display text-base tabular-nums tracking-tight sm:text-lg",
        entry.isPast ? "font-medium opacity-30" : "font-bold",
      )}
    >
      {entry.time}
    </span>
  );
}

function DepartureColumn({
  entries,
  routeLayer,
}: {
  entries: RouteEntry[];
  routeLayer: RouteLayer;
}): JSX.Element {
  return (
    <div class="flex flex-col gap-0.5">
      <div
        class={twMerge(
          "mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
          routeLayer.theme.legendText,
        )}
      >
        <span
          class="h-2 w-2 rounded-full"
          style={{ backgroundColor: routeLayer.theme.marker }}
        />
        <span class="truncate">{routeLayer.label}</span>
      </div>
      {entries.length === 0 ? (
        <span class="font-ui text-xs text-slate-400 italic">Fara curse</span>
      ) : (
        <div class="flex flex-wrap gap-x-3 gap-y-0.5">
          {entries.map((entry) => {
            const isNext =
              routeLayer.nextDeparture !== null &&
              entry.time === routeLayer.nextDeparture.time;
            return (
              <DepartureTime
                key={entry.time}
                entry={entry}
                isNext={isNext}
                nextMinutesUntil={
                  isNext ? routeLayer.nextDeparture!.minutesUntil : null
                }
                markerColor={routeLayer.theme.marker}
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
}: PosterSectionCardProps): JSX.Element {
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;

  const isEmpty =
    section.turEntries.length === 0 && section.returEntries.length === 0;

  const isCurrentSection = section.containsNow && isSelectedScheduleToday;

  return (
    <div
      class={twMerge(
        "rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3",
        section.isDaylight
          ? "border-amber-200/60 bg-amber-50/40"
          : "border-slate-200/80 bg-slate-50/50",
        isCurrentSection && "border-l-4 border-l-slate-900/25",
      )}
    >
      {/* Section header */}
      <div class="mb-2 flex items-baseline gap-2">
        <h3 class="font-display text-xl font-bold tracking-tight text-slate-900">
          {section.label}
        </h3>
        <span class="font-ui text-xs font-medium tracking-wide text-slate-400">
          {section.hourRange}
        </span>
        {isCurrentSection && (
          <span class="font-ui rounded-full bg-slate-900/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            acum
          </span>
        )}
      </div>

      {isEmpty ? (
        <p class="font-ui py-3 text-center text-sm text-slate-400 italic">
          Fara curse
        </p>
      ) : (
        <div class="grid grid-cols-2 gap-3">
          <DepartureColumn entries={section.turEntries} routeLayer={turLayer} />
          <DepartureColumn
            entries={section.returEntries}
            routeLayer={returLayer}
          />
        </div>
      )}
    </div>
  );
}
