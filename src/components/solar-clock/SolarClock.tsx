import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ClockDisplayMode } from "../../storage";
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
  className?: string;
}

export function SolarClock({
  busNumber,
  useWeekendSchedule,
  clockDisplayMode,
  className,
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

  const displayMode = clockDisplayMode?.value ?? "round";

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
        <div class="font-ui rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm shadow-slate-200/70">
          {useWeekendSchedule ? "Program weekend" : "Program lucru"}
        </div>
        {clockDisplayMode && <ClockModeToggle clockDisplayMode={clockDisplayMode} />}
      </div>

      {/* Update Notice */}
      <div class="mb-2 w-full rounded-lg bg-blue-50 px-4 py-2 text-center text-sm text-blue-800 border border-blue-100">
        Program actualizat pentru 5 Aprilie 2026.
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
    </div>
  );
}
