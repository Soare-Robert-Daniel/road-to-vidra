import { JSX } from "preact";

import { minutesToTimeLabel, type SolarTimesSummary } from "../../solar";

import { POSTER_SECTION_DEFS } from "./constants";
import type { PosterSection, RouteLayer } from "./constants";
import { PosterSectionCard } from "./PosterSectionCard";

interface PosterViewProps {
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
  isSelectedScheduleToday: boolean;
}

function buildSections(
  routeLayers: RouteLayer[],
  solarTimes: SolarTimesSummary,
  isSelectedScheduleToday: boolean,
): PosterSection[] {
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;

  return POSTER_SECTION_DEFS.map((def) => {
    const turEntries = turLayer.entries.filter(
      (e) => e.totalMinutes >= def.startMinutes && e.totalMinutes < def.endMinutes,
    );
    const returEntries = returLayer.entries.filter(
      (e) => e.totalMinutes >= def.startMinutes && e.totalMinutes < def.endMinutes,
    );
    const containsNow =
      isSelectedScheduleToday &&
      solarTimes.currentMinutes >= def.startMinutes &&
      solarTimes.currentMinutes < def.endMinutes;

    return {
      id: def.id,
      label: def.label,
      startMinutes: def.startMinutes,
      endMinutes: def.endMinutes,
      hourRange: def.hourRange,
      turEntries,
      returEntries,
      containsNow,
      isDaylight: def.isDaylight,
    };
  });
}

export function PosterView({
  routeLayers,
  solarTimes,
  isSelectedScheduleToday,
}: PosterViewProps): JSX.Element {
  const sections = buildSections(routeLayers, solarTimes, isSelectedScheduleToday);

  return (
    <div class="flex w-full flex-col gap-2 px-1">
      {/* Solar micro-labels */}
      <div class="font-ui flex items-center justify-center gap-3 text-[11px] font-medium text-slate-400">
        <span>☀ Rasarit {minutesToTimeLabel(solarTimes.sunriseMinutes)}</span>
        <span>☽ Apus {minutesToTimeLabel(solarTimes.sunsetMinutes)}</span>
      </div>

      {/* Section cards */}
      {sections.map((section) => (
        <PosterSectionCard
          key={section.id}
          section={section}
          routeLayers={routeLayers}
          isSelectedScheduleToday={isSelectedScheduleToday}
        />
      ))}
    </div>
  );
}
