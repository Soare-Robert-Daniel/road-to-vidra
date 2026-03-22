import { JSX } from "preact";
import { signal } from "@preact/signals";

import type { SolarTimesSummary } from "../../solar";

import { POSTER_SECTION_DEFS, type PosterSection, type RouteLayer } from "./constants";
import { PosterSectionCard } from "./PosterSectionCard";

interface PosterViewProps {
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
  isSelectedScheduleToday: boolean;
}

// Selected hours state (persisted per direction)
const selectedTurHour = signal<string | null>(null);
const selectedReturHour = signal<string | null>(null);

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
      titleColor: def.titleColor,
      bgColor: def.bgColor,
    };
  });
}

export function PosterView({
  routeLayers,
  solarTimes,
  isSelectedScheduleToday,
}: PosterViewProps): JSX.Element {
  const sections = buildSections(routeLayers, solarTimes, isSelectedScheduleToday);

  const handleHourSelect = (direction: "tur" | "retur", time: string, isPast: boolean) => {
    if (isPast) return; // Ignore past hours

    const selectedSignal = direction === "tur" ? selectedTurHour : selectedReturHour;

    // Toggle: if same hour selected, deselect
    if (selectedSignal.value === time) {
      selectedSignal.value = null;
    } else {
      selectedSignal.value = time;
    }
  };

  return (
    <div class="flex w-full flex-col gap-2 px-1">
      {/* Section cards */}
      {sections.map((section) => (
        <PosterSectionCard
          key={section.id}
          section={section}
          routeLayers={routeLayers}
          isSelectedScheduleToday={isSelectedScheduleToday}
          solarTimes={solarTimes}
          selectedTurHour={selectedTurHour}
          selectedReturHour={selectedReturHour}
          onHourSelect={handleHourSelect}
        />
      ))}
    </div>
  );
}
