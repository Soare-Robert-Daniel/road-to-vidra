import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ClockDisplayMode, type ColorScheme } from "../../storage";
import { useRouteLayers } from "../../hooks/useRouteLayers";
import { useWeatherData } from "../../hooks/useWeatherData";
import { minutesToTimeLabel } from "../../solar";

import { ClockDefs } from "./ClockDefs";
import { ClockFaceBackground, ClockFaceLabels } from "./ClockFace";
import { ClockFaceLegends } from "./ClockFaceLegends";
import { ClockHand } from "./ClockHand";
import { ClockModeToggle } from "./ClockModeToggle";
import { DepartureSummaries } from "./DepartureSummaries";
import { PosterView } from "./PosterView";
import { TableView } from "./TableView";
import { TemperatureWave } from "./TemperatureWave";
import { RouteMarkers } from "./RouteMarkers";
import { SolarBand } from "./SolarBand";
import { TimelineView } from "./TimelineView";
import { MapView } from "./MapView";
import { ColorSchemeToggle } from "../../v2/ColorSchemeToggle";
import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  CLOCK_SIZE,
  getNextDepartureSummary,
} from "./constants";

interface SolarClockProps {
  busNumber: string;
  useWeekendSchedule: boolean;
  clockDisplayMode?: Signal<ClockDisplayMode>;
  colorScheme?: Signal<ColorScheme>;
  className?: string;
  availableModes?: ClockDisplayMode[];
}

export function SolarClock({
  busNumber,
  useWeekendSchedule,
  clockDisplayMode,
  colorScheme,
  className,
  availableModes,
}: SolarClockProps): JSX.Element {
  const result = useRouteLayers(busNumber, useWeekendSchedule);
  const { data: weatherData } = useWeatherData();

  if (!result) {
    return (
      <div
        class={twMerge(
          "rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm",
          className,
        )}
      >
        Nu exista date pentru autobuzul {busNumber}
      </div>
    );
  }

  const { routeLayers, solarTimes, isSelectedScheduleToday } = result;

  const displayMode = clockDisplayMode?.value ?? "tabel";

  const clockFaceId = `clockFace-${busNumber}`;
  const shadowId = `clockShadow-${busNumber}`;
  const formatUpcoming = (layer: (typeof routeLayers)[number]) => {
    if (layer.upcomingDepartures.length === 0) return "indisponibila";
    return layer.upcomingDepartures
      .map((d) => `${d.time} (${getNextDepartureSummary(d)})`)
      .join(", ");
  };
  const accessibilityLabel = [
    `Ceas solar integrat pentru autobuzul ${busNumber}`,
    `rasarit ${minutesToTimeLabel(solarTimes.sunriseMinutes)}`,
    `apus ${minutesToTimeLabel(solarTimes.sunsetMinutes)}`,
    `ora curenta ${minutesToTimeLabel(solarTimes.currentMinutes)}`,
    `urmatoarele curse tur: ${formatUpcoming(routeLayers[0])}`,
    `urmatoarele curse retur: ${formatUpcoming(routeLayers[1])}`,
  ].join(", ");

  return (
    <div
      class={twMerge(
        "mx-auto flex w-full max-w-xl flex-col items-center gap-2 text-slate-900",
        className,
      )}
    >
      {/* Compact header: bus number + schedule badge + mode toggle */}
      <div class="flex w-full items-center justify-between gap-2 px-1 pt-0.5">
        {clockDisplayMode && (
          <ClockModeToggle
            clockDisplayMode={clockDisplayMode}
            colorScheme={colorScheme}
            availableModes={availableModes}
          />
        )}
      </div>

      {/* Conditional view */}
      {displayMode === "poster" ? (
        <PosterView
          routeLayers={routeLayers}
          solarTimes={solarTimes}
          isSelectedScheduleToday={isSelectedScheduleToday}
        />
      ) : displayMode === "tabel" ? (
        <TableView
          routeLayers={routeLayers}
          solarTimes={solarTimes}
          isSelectedScheduleToday={isSelectedScheduleToday}
        />
      ) : displayMode === "timeline" ? (
        <TimelineView routeLayers={routeLayers} solarTimes={solarTimes} />
      ) : (
        <>
          <div class="w-full px-1">
            <svg
              viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
              class="mx-auto block w-full max-w-xl"
              aria-label={accessibilityLabel}
              role="img"
            >
              <ClockDefs clockFaceId={clockFaceId} shadowId={shadowId} />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={CLOCK_LAYOUT.faceRadius + 10}
                fill={CLOCK_COLORS.surface}
                opacity={String(CLOCK_COLORS.shadowSurfaceOpacity)}
                filter={`url(#${shadowId})`}
              />
              <ClockFaceBackground clockFaceId={clockFaceId} />
              <SolarBand solarTimes={solarTimes} />
              <ClockFaceLegends routeLayers={routeLayers} />
              <RouteMarkers
                routeLayers={routeLayers}
                directions={["retur"]}
                showMinuteLabels={false}
              />
              <ClockFaceLabels />
              <RouteMarkers
                routeLayers={routeLayers}
                directions={["tur"]}
                showMinuteLabels={false}
              />
              <ClockHand currentMinutes={solarTimes.currentMinutes} />
            </svg>
          </div>
          <DepartureSummaries routeLayers={routeLayers} solarTimes={solarTimes} />
          {weatherData.value?.temperatures && weatherData.value.temperatures.length > 0 && (
            <TemperatureWave
              temperatures={weatherData.value.temperatures}
              currentMinutes={solarTimes.currentMinutes}
            />
          )}
        </>
      )}

      {/* Map at bottom of all modes */}
      <MapView busNumber={busNumber as "418" | "420" | "438"} />

      {/* Color scheme toggle */}
      {colorScheme && <ColorSchemeToggle colorScheme={colorScheme} />}
    </div>
  );
}
