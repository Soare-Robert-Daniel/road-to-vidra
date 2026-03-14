import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { busScheduleData } from "../../config";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { getNextDeparture, getSolarTimes, minutesToTimeLabel } from "../../solar";
import { isWeekendProgram } from "../../utils";

import { ClockDefs } from "./ClockDefs";
import { ClockFaceBackground, ClockFaceLabels } from "./ClockFace";
import { ClockFaceLegends } from "./ClockFaceLegends";
import { ClockHand } from "./ClockHand";
import { DepartureSummaries } from "./DepartureSummaries";
import { RouteMarkers } from "./RouteMarkers";
import { SolarBand } from "./SolarBand";
import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  CLOCK_SIZE,
  getClockTheme,
  getNextDepartureSummary,
  getRouteLegendLabel,
  getTimeParts,
  isDepartureInDaylight,
  ROUTE_GEOMETRY,
} from "./constants";
import type { RouteLayer } from "./constants";

interface SolarClockProps {
  busNumber: string;
  useWeekendSchedule: boolean;
  className?: string;
}

/**
 * Main solar clock component that displays a 24-hour clock with bus departure times.
 * 
 * Renders:
 * - Bus number and schedule type badge at the top
 * - SVG clock visualization with:
 *   - Clock face with hour labels (0-24) and minute ticks
 *   - Sunrise-to-sunset golden band
 *   - Current time hand pointing to now
 *   - Route layers (tur/retur) showing all departure times as colored tick marks
 *   - Timeline ring showing current time position
 *   - Next departure highlighted with pulsing glow animation
 * - Text summaries below showing next departure time and when it leaves for each route
 */
export function SolarClock({
  busNumber,
  useWeekendSchedule,
  className,
}: SolarClockProps): JSX.Element {
  const busData = busScheduleData.bus[busNumber];

  if (!busData?.tur || !busData?.retur) {
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

  const currentTimeSignal = useCurrentTime();
  const now = new Date(currentTimeSignal.value);
  const solarTimes = getSolarTimes(now);
  const isSelectedScheduleToday = isWeekendProgram(now) === useWeekendSchedule;
  const routeLayers: RouteLayer[] = (["tur", "retur"] as const).map(
    (direction) => {
      const route = busData[direction];
      const hours = useWeekendSchedule
        ? route.weekendHours
        : route.workingHours;
      const entries = hours.map((hour, index) => {
        const timeParts = getTimeParts(hour);

        return {
          index,
          time: hour,
          ...timeParts,
          isDaylight: isDepartureInDaylight(timeParts.totalMinutes, solarTimes),
          isPast:
            isSelectedScheduleToday &&
            timeParts.totalMinutes < solarTimes.currentMinutes,
        };
      });

      return {
        direction,
        label: getRouteLegendLabel(direction, route.station),
        entries,
        nextDeparture: getNextDeparture(hours, useWeekendSchedule, now),
        theme: getClockTheme(busNumber, direction),
        geometry: ROUTE_GEOMETRY[direction],
      };
    },
  );

  const clockFaceId = `clockFace-${busNumber}`;
  const daylightId = `daylight-${busNumber}`;
  const shadowId = `clockShadow-${busNumber}`;
  const accessibilityLabel = [
    `Ceas solar integrat pentru autobuzul ${busNumber}`,
    `rasarit ${minutesToTimeLabel(solarTimes.sunriseMinutes)}`,
    `apus ${minutesToTimeLabel(solarTimes.sunsetMinutes)}`,
    `ora curenta ${minutesToTimeLabel(solarTimes.currentMinutes)}`,
    `urmatoarea cursa tur ${routeLayers[0].nextDeparture?.time ?? "indisponibila"}, ${getNextDepartureSummary(routeLayers[0].nextDeparture)}`,
    `urmatoarea cursa retur ${routeLayers[1].nextDeparture?.time ?? "indisponibila"}, ${getNextDepartureSummary(routeLayers[1].nextDeparture)}`,
  ].join(", ");

  return (
    <div
      class={twMerge(
        "mx-auto flex w-full max-w-xl flex-col items-center gap-2 text-slate-900",
        className,
      )}
    >
      <div class="flex w-full items-center justify-center gap-2 px-1 pt-0.5">
        <div class="text-4xl font-black tracking-tight text-slate-950">
          {busNumber}
        </div>
        <div class="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm shadow-slate-200/70">
          {useWeekendSchedule ? "Program weekend" : "Program lucru"}
        </div>
      </div>

      <div class="w-full px-1">
        <svg
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          class="mx-auto block w-full max-w-xl"
          aria-label={accessibilityLabel}
          role="img"
        >
          <ClockDefs
            clockFaceId={clockFaceId}
            daylightId={daylightId}
            shadowId={shadowId}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CLOCK_LAYOUT.faceRadius + 10}
            fill={CLOCK_COLORS.surface}
            opacity={String(CLOCK_COLORS.shadowSurfaceOpacity)}
            filter={`url(#${shadowId})`}
          />
          <ClockFaceBackground clockFaceId={clockFaceId} />
          <SolarBand solarTimes={solarTimes} daylightId={daylightId} />
          <ClockFaceLegends routeLayers={routeLayers} />
          <RouteMarkers routeLayers={routeLayers} directions={["retur"]} />
          <ClockFaceLabels />
          <RouteMarkers routeLayers={routeLayers} directions={["tur"]} />
          <ClockHand currentMinutes={solarTimes.currentMinutes} />
        </svg>
      </div>

      <DepartureSummaries routeLayers={routeLayers} />
    </div>
  );
}
