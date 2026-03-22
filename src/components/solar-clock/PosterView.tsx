import { JSX } from "preact";
import { signal } from "@preact/signals";

import type { SolarTimesSummary } from "../../solar";
import { useWeatherData } from "../../hooks/useWeatherData";

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

// Extract destination from label like "Tur · Bucuresti"
function getDestinationFromLabel(label: string): string {
  const parts = label.split(" · ");
  return parts[1] ?? label;
}

// Format minutes to compact countdown like "1h 04m" (no "min" word)
function formatCountdownCompact(minutes: number): string {
  if (minutes <= 0) return "acum";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins.toString().padStart(2, "0")}m` : `${hours}h`;
  }
  return `${mins} min`;
}

function LiveStatusCard({ routeLayer }: { routeLayer: RouteLayer }): JSX.Element {
  const destination = getDestinationFromLabel(routeLayer.label);
  const upcoming = routeLayer.upcomingDepartures;

  // No departures available
  if (upcoming.length === 0) {
    return (
      <div class="rounded-lg px-2 py-1">
        <span
          class="inline-block h-2 w-2 rounded-full mr-1.5"
          style={{ backgroundColor: routeLayer.theme.marker }}
        />
        <span class="font-ui text-base font-bold" style={{ color: routeLayer.theme.marker }}>
          {destination}
        </span>
        <span class="font-ui text-sm text-slate-400 italic ml-2">Indisponibil</span>
      </div>
    );
  }

  const primary = upcoming[0];
  const future = upcoming.slice(1, 4);
  const isAcum = primary.minutesUntil < 1;

  // Calculate additional wait time for future departures (relative to primary)
  const getAdditionalWait = (depMinutes: number, primaryMinutes: number): number => {
    return depMinutes - primaryMinutes;
  };

  return (
    <div class="flex flex-col gap-1 rounded-lg px-1.5 py-1.5">
      {/* Row 1: Colored dot • Destination — Countdown (large, bold) */}
      <div class="flex items-baseline justify-between">
        <div class="flex items-baseline gap-1.5">
          <span
            class="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: routeLayer.theme.marker }}
          />
          <span class="font-ui text-base font-bold" style={{ color: routeLayer.theme.marker }}>
            {destination}
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          {isAcum ? (
            <span
              class="animate-pulse font-ui text-lg font-bold uppercase"
              style={{ color: routeLayer.theme.marker }}
            >
              ACUM
            </span>
          ) : (
            <span
              class="font-ui text-lg font-bold tabular-nums"
              style={{ color: routeLayer.theme.marker }}
            >
              în {formatCountdownCompact(primary.minutesUntil)}
            </span>
          )}
          <small class="font-ui text-xs text-slate-400">({primary.time})</small>
        </div>
      </div>

      {/* Row 2: Future departures as timeline block */}
      {future.length > 0 && (
        <div class="flex items-start justify-end gap-3">
          {future.map((dep) => {
            const additionalWait = getAdditionalWait(dep.minutesUntil, primary.minutesUntil);
            return (
              <div key={dep.time} class="flex flex-col items-center">
                <small class="font-ui text-[10px] text-slate-400 tabular-nums">{dep.time}</small>
                <span
                  class="font-ui text-sm font-semibold tabular-nums"
                  style={{ color: routeLayer.theme.marker }}
                >
                  +{formatCountdownCompact(additionalWait)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
  const turLayer = routeLayers.find((r) => r.direction === "tur")!;
  const returLayer = routeLayers.find((r) => r.direction === "retur")!;
  const { data: weatherData } = useWeatherData();

  const handleHourSelect = (direction: "tur" | "retur", time: string) => {
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
      {/* Global header with next departures - two rows */}
      <div class="flex flex-col gap-1 px-1 pb-1">
        <LiveStatusCard key="tur-status" routeLayer={turLayer} />
        <LiveStatusCard key="retur-status" routeLayer={returLayer} />
      </div>

      {/* Section cards */}
      {sections.map((section) => (
        <PosterSectionCard
          key={section.id}
          section={section}
          routeLayers={routeLayers}
          solarTimes={solarTimes}
          selectedTurHour={selectedTurHour}
          selectedReturHour={selectedReturHour}
          onHourSelect={handleHourSelect}
          temperatures={weatherData.value?.temperatures ?? null}
        />
      ))}
    </div>
  );
}
