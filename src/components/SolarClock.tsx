import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { busScheduleData } from "../config";
import { useCurrentTime } from "../hooks/useCurrentTime";
import type { NextDeparture, SolarTimesSummary } from "../solar";
import {
  getNextDeparture,
  getSolarTimes,
  minutesToTimeLabel,
  timeToClockAngle,
} from "../solar";
import {
  formatTimeDifference,
  isWeekendProgram,
  timeToMinutes,
} from "../utils";

interface SolarClockProps {
  busNumber: string;
  useWeekendSchedule: boolean;
  className?: string;
}

type Direction = "tur" | "retur";

interface RouteGeometry {
  laneRadius: number;
  guideDash: string;
  labelRadius: number;
  denseLabelRadius: number;
  bottomLabelOffset: number;
  bottomTangentialPixelsPerMinute: number;
  labelFontSize: number;
}

interface RouteTheme {
  marker: string;
  markerSoft: string;
  legendBg: string;
  legendText: string;
  summaryBorder: string;
  summarySurface: string;
  summaryText: string;
  summaryMuted: string;
}

interface RouteEntry {
  index: number;
  time: string;
  minute: string;
  totalMinutes: number;
  isDaylight: boolean;
  isPast: boolean;
}

interface RouteLayer {
  direction: Direction;
  label: string;
  entries: RouteEntry[];
  nextDeparture: NextDeparture | null;
  theme: RouteTheme;
  geometry: RouteGeometry;
}

const MINUTES_PER_DAY = 24 * 60;

const CLOCK_LAYOUT = {
  size: 620,
  faceRadius: 190,
  timelineRadius: 250,
  timelineWidth: 24,
  timelineFrameOffset: 2,
  timelineHaloOffset: 10,
  dialLabelRadius: 124,
  tickInnerRadius: 158,
  tickOuterRadius: 178,
  minorTickInset: 8,
  currentHandLength: 108,
  currentHandTail: 22,
  currentHandStrokeWidth: 1.8,
  currentHandTipRadius: 3,
  currentTimelineDotRadius: 5.4,
  currentTimelineDotStrokeWidth: 2.5,
  centerOuterRadius: 18,
  centerOuterStrokeWidth: 2,
  centerInnerRadius: 10,
  centerInnerStrokeWidth: 3,
  centerCoreRadius: 3.5,
} as const;

const SOLAR_BAND_STYLE = {
  radius: 146,
  width: 8,
  baseOpacity: 1,
} as const;

const HAND_STYLE = {
  baseWidth: 8,
  tipWidth: 3.2,
  shoulderInset: 14,
  tailWidthRatio: 0.72,
  shadowTranslateX: 1.8,
  shadowTranslateY: 2.2,
} as const;

const TICK_STYLE = {
  hourWidth: 3.5,
  minuteWidth: 2,
} as const;

const LABEL_STYLE = {
  dialHourSize: 22,
  dialHourStrokeWidth: 6.5,
  dialHourBaselineOffset: 2,
  routeBaseOpacity: 0.96,
  routePastOpacity: 0.5,
  routeStrokeWidth: 5.2,
  routeNextStrokeWidth: 6.2,
  routeBaselineOffset: 1.5,
  bottomTargetMinutes: 12 * 60,
  bottomSectorRange: 80,
} as const;

const ROUTE_MARKER_STYLE = {
  guideWidth: 1.2,
  guideOpacity: 0.55,
  segmentWidth: 5.2,
  pastSegmentMultiplier: 0.45,
  tickInset: 7,
  nextTickInset: 12,
  tickOpacity: 0.9,
  pastTickOpacity: 0.34,
  tickWidth: 3.1,
  nextTickWidth: 5.4,
  nextGlowWidth: 12,
  nextGlowOpacity: 0.16,
} as const;

const NEXT_GLOW_ANIMATION = {
  duration: "4.2s",
  staggerDelay: "2.1s",
  peakOpacity: 0.28,
  peakWidthOffset: 3,
} as const;

const CURRENT_TIME_RING_STYLE = {
  overhang: 15,
  strokeWidth: 4,
  strokeOpacity: 0.95,
} as const;

const SHADOW_STYLE = {
  offsetY: 14,
  blur: 18,
} as const;

const HEADWAY_STYLE = {
  denseGapMax: 35,
  mediumGapMax: 60,
  denseOpacity: 0.38,
  mediumOpacity: 0.28,
  sparseOpacity: 0.18,
} as const;

const CLOCK_COLORS = {
  hand: "#1e3a5f",
  handShadow: "#0f172a",
  currentRingIndicator: "#0f172a",
  surface: "#ffffff",
  faceGradientStart: "#ffffff",
  faceGradientMid: "#f8fbff",
  faceGradientEnd: "#edf4fb",
  faceStroke: "#d9e3ee",
  timelineFrame: "#eff4fa",
  timelineBase: "#dbe7f2",
  tickMajor: "#64748b",
  tickMinor: "#c2cfdd",
  dialText: "#0f172a",
  dialTextStroke: "rgba(255,255,255,0.9)",
  routeTextStroke: "rgba(255,255,255,0.95)",
  shadowColor: "#94a3b8",
  shadowOpacity: 0.18,
  shadowSurfaceOpacity: 0.92,
  currentTipFill: "#ffffff",
  currentTipOpacity: 0.9,
  centerOuterStroke: "#d8e1ec",
  centerInnerFill: "#f8fafc",
  solarBandBase: "#e8f0f8",
  daylightStart: "#f7d986",
  daylightMid: "#f2be58",
  daylightEnd: "#f29b38",
} as const;

const CLOCK_SIZE = CLOCK_LAYOUT.size;
const CENTER = CLOCK_SIZE / 2;
const FACE_RADIUS = CLOCK_LAYOUT.faceRadius;
const TIMELINE_RADIUS = CLOCK_LAYOUT.timelineRadius;
const TIMELINE_WIDTH = CLOCK_LAYOUT.timelineWidth;
const LABEL_RADIUS = CLOCK_LAYOUT.dialLabelRadius;
const TICK_INNER_RADIUS = CLOCK_LAYOUT.tickInnerRadius;
const TICK_OUTER_RADIUS = CLOCK_LAYOUT.tickOuterRadius;
const CURRENT_HAND_LENGTH = CLOCK_LAYOUT.currentHandLength;
const CURRENT_HAND_TAIL = CLOCK_LAYOUT.currentHandTail;

const BUS_ROUTE_THEMES: Record<string, Record<Direction, RouteTheme>> = {
  "420": {
    tur: {
      marker: "#1d4ed8",
      markerSoft: "#93c5fd",
      legendBg: "bg-blue-50/80",
      legendText: "text-blue-800",
      summaryBorder: "border-blue-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-blue-950",
      summaryMuted: "text-blue-800",
    },
    retur: {
      marker: "#047857",
      markerSoft: "#6ee7b7",
      legendBg: "bg-emerald-50/80",
      legendText: "text-emerald-800",
      summaryBorder: "border-emerald-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-emerald-950",
      summaryMuted: "text-emerald-800",
    },
  },
  default: {
    tur: {
      marker: "#b91c1c",
      markerSoft: "#fca5a5",
      legendBg: "bg-red-50/80",
      legendText: "text-red-800",
      summaryBorder: "border-red-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-red-950",
      summaryMuted: "text-red-800",
    },
    retur: {
      marker: "#6d28d9",
      markerSoft: "#c4b5fd",
      legendBg: "bg-violet-50/80",
      legendText: "text-violet-800",
      summaryBorder: "border-violet-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-violet-950",
      summaryMuted: "text-violet-800",
    },
  },
};

const ROUTE_GEOMETRY: Record<Direction, RouteGeometry> = {
  tur: {
    laneRadius: 258,
    guideDash: "3 12",
    labelRadius: 295,
    denseLabelRadius: 298,
    bottomLabelOffset: 0,
    bottomTangentialPixelsPerMinute: 0,
    labelFontSize: 24,
  },
  retur: {
    laneRadius: 242,
    guideDash: "2 10",
    labelRadius: 213,
    denseLabelRadius: 210,
    bottomLabelOffset: 0,
    bottomTangentialPixelsPerMinute: 0,
    labelFontSize: 24,
  },
};

function getPointOnCircle(minutes: number, radius: number) {
  const angle = (timeToClockAngle(minutes) * Math.PI) / 180;

  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function getArcPath(startMinutes: number, endMinutes: number, radius: number) {
  const startPoint = getPointOnCircle(startMinutes, radius);
  const endPoint = getPointOnCircle(endMinutes, radius);
  const spanMinutes =
    (((endMinutes - startMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY;
  const largeArcFlag = spanMinutes > MINUTES_PER_DAY / 2 ? 1 : 0;

  return [
    `M ${startPoint.x} ${startPoint.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`,
  ].join(" ");
}

function getTimeParts(time: string) {
  const [, minutePart] = time.split(":");

  return {
    minute: minutePart.padStart(2, "0"),
    totalMinutes: timeToMinutes(time),
  };
}

function getHandPath(
  totalMinutes: number,
  length: number,
  tailLength: number,
  baseWidth: number,
  tipWidth: number,
) {
  const angle = (timeToClockAngle(totalMinutes) * Math.PI) / 180;
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const perpendicularX = -directionY;
  const perpendicularY = directionX;
  const shoulderDistance = length - HAND_STYLE.shoulderInset;
  const tailWidth = baseWidth * HAND_STYLE.tailWidthRatio;

  const leftTail = {
    x: CENTER - directionX * tailLength + perpendicularX * tailWidth,
    y: CENTER - directionY * tailLength + perpendicularY * tailWidth,
  };
  const rightTail = {
    x: CENTER - directionX * tailLength - perpendicularX * tailWidth,
    y: CENTER - directionY * tailLength - perpendicularY * tailWidth,
  };
  const leftBase = {
    x: CENTER + perpendicularX * baseWidth,
    y: CENTER + perpendicularY * baseWidth,
  };
  const rightBase = {
    x: CENTER - perpendicularX * baseWidth,
    y: CENTER - perpendicularY * baseWidth,
  };
  const leftShoulder = {
    x: CENTER + directionX * shoulderDistance + perpendicularX * tipWidth,
    y: CENTER + directionY * shoulderDistance + perpendicularY * tipWidth,
  };
  const rightShoulder = {
    x: CENTER + directionX * shoulderDistance - perpendicularX * tipWidth,
    y: CENTER + directionY * shoulderDistance - perpendicularY * tipWidth,
  };
  const tip = {
    x: CENTER + directionX * length,
    y: CENTER + directionY * length,
  };

  return [
    `M ${leftTail.x} ${leftTail.y}`,
    `L ${leftBase.x} ${leftBase.y}`,
    `L ${leftShoulder.x} ${leftShoulder.y}`,
    `L ${tip.x} ${tip.y}`,
    `L ${rightShoulder.x} ${rightShoulder.y}`,
    `L ${rightBase.x} ${rightBase.y}`,
    `L ${rightTail.x} ${rightTail.y}`,
    "Z",
  ].join(" ");
}

function getClockTheme(busNumber: string, direction: Direction) {
  const busThemes = BUS_ROUTE_THEMES[busNumber] ?? BUS_ROUTE_THEMES.default;

  return busThemes[direction];
}

function getRouteLegendLabel(direction: Direction, station: string): string {
  const destinationMatch = station.match(/^Spre\s+(.+?)(?:\s+din|$)/i);
  const destination = destinationMatch?.[1] ?? station;

  return `${direction === "tur" ? "Tur" : "Retur"} · ${destination}`;
}

function isDepartureInDaylight(
  totalMinutes: number,
  solarTimes: SolarTimesSummary,
): boolean {
  return (
    totalMinutes >= solarTimes.sunriseMinutes &&
    totalMinutes < solarTimes.sunsetMinutes
  );
}

function getNextDepartureSummary(nextDeparture: NextDeparture | null): string {
  if (!nextDeparture) {
    return "Nu exista curse disponibile";
  }

  const relativeTime =
    nextDeparture.minutesUntil <= 0
      ? "acum"
      : `peste ${formatTimeDifference(nextDeparture.minutesUntil)}`;

  if (nextDeparture.dayOffset === 0) {
    return relativeTime;
  }

  if (nextDeparture.dayOffset === 1) {
    return `maine, ${relativeTime}`;
  }

  const weekday = nextDeparture.targetDate.toLocaleDateString("ro-RO", {
    weekday: "short",
  });

  return `${weekday}, ${relativeTime}`;
}

function getCompactNextDepartureSummary(
  nextDeparture: NextDeparture | null,
): string {
  if (!nextDeparture) {
    return "fara curse";
  }

  const relativeTime =
    nextDeparture.minutesUntil <= 0
      ? "acum"
      : formatTimeDifference(nextDeparture.minutesUntil);

  if (nextDeparture.dayOffset === 0) {
    return relativeTime;
  }

  if (nextDeparture.dayOffset === 1) {
    return `maine • ${relativeTime}`;
  }

  const weekday = nextDeparture.targetDate.toLocaleDateString("ro-RO", {
    weekday: "short",
  });

  return `${weekday} • ${relativeTime}`;
}

function getHeadwayOpacity(spanMinutes: number): number {
  if (spanMinutes <= HEADWAY_STYLE.denseGapMax) {
    return HEADWAY_STYLE.denseOpacity;
  }

  if (spanMinutes <= HEADWAY_STYLE.mediumGapMax) {
    return HEADWAY_STYLE.mediumOpacity;
  }

  return HEADWAY_STYLE.sparseOpacity;
}

function getCircularMinuteDistance(
  fromMinutes: number,
  toMinutes: number,
): number {
  const distance = Math.abs(fromMinutes - toMinutes) % MINUTES_PER_DAY;

  return Math.min(distance, MINUTES_PER_DAY - distance);
}

function getSignedCircularMinuteDifference(
  fromMinutes: number,
  toMinutes: number,
): number {
  const wrappedDifference =
    (((fromMinutes - toMinutes + MINUTES_PER_DAY / 2) % MINUTES_PER_DAY) +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY;

  return wrappedDifference - MINUTES_PER_DAY / 2;
}

function getMinuteSectorWeight(
  totalMinutes: number,
  targetMinutes: number,
  sectorRange: number,
): number {
  const distance = getCircularMinuteDistance(totalMinutes, targetMinutes);

  if (distance >= sectorRange) {
    return 0;
  }

  return 1 - distance / sectorRange;
}

function getDepartureLabelRadius(
  routeLayer: RouteLayer,
  departure: RouteEntry,
): number {
  const previousDeparture = routeLayer.entries[departure.index - 1];
  const upcomingDeparture = routeLayer.entries[departure.index + 1];
  const previousGap = previousDeparture
    ? departure.totalMinutes - previousDeparture.totalMinutes
    : Number.POSITIVE_INFINITY;
  const nextGap = upcomingDeparture
    ? upcomingDeparture.totalMinutes - departure.totalMinutes
    : Number.POSITIVE_INFINITY;
  const isDenseCluster = Math.min(previousGap, nextGap) <= 42;

  const labelRadius = !isDenseCluster
    ? routeLayer.geometry.labelRadius
    : departure.index % 2 === 0
      ? routeLayer.geometry.labelRadius
      : routeLayer.geometry.denseLabelRadius;

  const bottomWeight = getMinuteSectorWeight(
    departure.totalMinutes,
    LABEL_STYLE.bottomTargetMinutes,
    LABEL_STYLE.bottomSectorRange,
  );

  return labelRadius + routeLayer.geometry.bottomLabelOffset * bottomWeight;
}

function getDepartureLabelPoint(routeLayer: RouteLayer, departure: RouteEntry) {
  const labelRadius = getDepartureLabelRadius(routeLayer, departure);
  const basePoint = getPointOnCircle(departure.totalMinutes, labelRadius);
  const bottomWeight = getMinuteSectorWeight(
    departure.totalMinutes,
    LABEL_STYLE.bottomTargetMinutes,
    LABEL_STYLE.bottomSectorRange,
  );

  if (
    bottomWeight === 0 ||
    routeLayer.geometry.bottomTangentialPixelsPerMinute === 0
  ) {
    return basePoint;
  }

  const signedBottomDifference = getSignedCircularMinuteDifference(
    departure.totalMinutes,
    LABEL_STYLE.bottomTargetMinutes,
  );
  const tangentialShift =
    signedBottomDifference *
    routeLayer.geometry.bottomTangentialPixelsPerMinute *
    bottomWeight;
  const angle = (timeToClockAngle(departure.totalMinutes) * Math.PI) / 180;

  return {
    x: basePoint.x - Math.sin(angle) * tangentialShift,
    y: basePoint.y + Math.cos(angle) * tangentialShift,
  };
}

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
  const daylightArcPath = getArcPath(
    solarTimes.sunriseMinutes,
    solarTimes.sunsetMinutes,
    SOLAR_BAND_STYLE.radius,
  );
  const currentHandPoint = getPointOnCircle(
    solarTimes.currentMinutes,
    CURRENT_HAND_LENGTH,
  );
  const currentTimelinePoint = getPointOnCircle(
    solarTimes.currentMinutes,
    SOLAR_BAND_STYLE.radius,
  );
  const currentMinuteRingStart = getPointOnCircle(
    solarTimes.currentMinutes,
    TIMELINE_RADIUS - TIMELINE_WIDTH / 2 - CURRENT_TIME_RING_STYLE.overhang,
  );
  const currentMinuteRingEnd = getPointOnCircle(
    solarTimes.currentMinutes,
    TIMELINE_RADIUS + TIMELINE_WIDTH / 2 + CURRENT_TIME_RING_STYLE.overhang,
  );
  const currentHandPath = getHandPath(
    solarTimes.currentMinutes,
    CURRENT_HAND_LENGTH,
    CURRENT_HAND_TAIL,
    HAND_STYLE.baseWidth,
    HAND_STYLE.tipWidth,
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
          <defs>
            <radialGradient id={clockFaceId} cx="50%" cy="42%" r="72%">
              <stop offset="0%" stop-color={CLOCK_COLORS.faceGradientStart} />
              <stop offset="72%" stop-color={CLOCK_COLORS.faceGradientMid} />
              <stop offset="100%" stop-color={CLOCK_COLORS.faceGradientEnd} />
            </radialGradient>
            <linearGradient id={daylightId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color={CLOCK_COLORS.daylightStart} />
              <stop offset="55%" stop-color={CLOCK_COLORS.daylightMid} />
              <stop offset="100%" stop-color={CLOCK_COLORS.daylightEnd} />
            </linearGradient>
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy={String(SHADOW_STYLE.offsetY)}
                stdDeviation={String(SHADOW_STYLE.blur)}
                flood-color={CLOCK_COLORS.shadowColor}
                flood-opacity={String(CLOCK_COLORS.shadowOpacity)}
              />
            </filter>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r={
              TIMELINE_RADIUS +
              TIMELINE_WIDTH / 2 +
              CLOCK_LAYOUT.timelineHaloOffset
            }
            fill={CLOCK_COLORS.surface}
            opacity={String(CLOCK_COLORS.shadowSurfaceOpacity)}
            filter={`url(#${shadowId})`}
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={
              TIMELINE_RADIUS +
              TIMELINE_WIDTH / 2 +
              CLOCK_LAYOUT.timelineFrameOffset
            }
            fill="none"
            stroke={CLOCK_COLORS.timelineFrame}
            stroke-width="8"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={TIMELINE_RADIUS}
            fill="none"
            stroke={CLOCK_COLORS.timelineBase}
            stroke-width={TIMELINE_WIDTH}
            stroke-linecap="round"
          />
          <line
            x1={currentMinuteRingStart.x}
            y1={currentMinuteRingStart.y}
            x2={currentMinuteRingEnd.x}
            y2={currentMinuteRingEnd.y}
            stroke={CLOCK_COLORS.currentRingIndicator}
            stroke-width={String(CURRENT_TIME_RING_STYLE.strokeWidth)}
            stroke-linecap="round"
            opacity={String(CURRENT_TIME_RING_STYLE.strokeOpacity)}
          />

          {routeLayers.map((routeLayer) => (
            <circle
              key={`guide-${routeLayer.direction}`}
              cx={CENTER}
              cy={CENTER}
              r={routeLayer.geometry.laneRadius}
              fill="none"
              stroke={routeLayer.theme.markerSoft}
              stroke-width={String(ROUTE_MARKER_STYLE.guideWidth)}
              stroke-dasharray={routeLayer.geometry.guideDash}
              opacity={String(ROUTE_MARKER_STYLE.guideOpacity)}
            />
          ))}

          {routeLayers.map((routeLayer) =>
            routeLayer.entries.slice(0, -1).map((departure, index) => {
              const nextEntry = routeLayer.entries[index + 1];
              const spanMinutes =
                nextEntry.totalMinutes - departure.totalMinutes;
              const segmentOpacity = getHeadwayOpacity(spanMinutes);

              return (
                <path
                  key={`segment-${routeLayer.direction}-${departure.time}-${nextEntry.time}`}
                  d={getArcPath(
                    departure.totalMinutes,
                    nextEntry.totalMinutes,
                    routeLayer.geometry.laneRadius,
                  )}
                  fill="none"
                  stroke={routeLayer.theme.markerSoft}
                  stroke-width={String(ROUTE_MARKER_STYLE.segmentWidth)}
                  stroke-linecap="round"
                  opacity={
                    departure.isPast && nextEntry.isPast
                      ? segmentOpacity *
                        ROUTE_MARKER_STYLE.pastSegmentMultiplier
                      : segmentOpacity
                  }
                />
              );
            }),
          )}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={FACE_RADIUS}
            fill={`url(#${clockFaceId})`}
            stroke={CLOCK_COLORS.faceStroke}
            stroke-width="2"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={SOLAR_BAND_STYLE.radius}
            fill="none"
            stroke={CLOCK_COLORS.solarBandBase}
            stroke-width={String(SOLAR_BAND_STYLE.width)}
            opacity={String(SOLAR_BAND_STYLE.baseOpacity)}
            stroke-linecap="round"
          />
          <path
            d={daylightArcPath}
            fill="none"
            stroke={`url(#${daylightId})`}
            stroke-width={String(SOLAR_BAND_STYLE.width)}
            stroke-linecap="round"
          />

          {Array.from({ length: 48 }, (_, index) => {
            const minuteValue = index * 30;
            const isHourMark = minuteValue % 60 === 0;
            const start = getPointOnCircle(
              minuteValue,
              isHourMark
                ? TICK_INNER_RADIUS
                : TICK_INNER_RADIUS + CLOCK_LAYOUT.minorTickInset,
            );
            const end = getPointOnCircle(minuteValue, TICK_OUTER_RADIUS);

            return (
              <line
                key={`tick-${minuteValue}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={
                  isHourMark ? CLOCK_COLORS.tickMajor : CLOCK_COLORS.tickMinor
                }
                stroke-width={
                  isHourMark
                    ? String(TICK_STYLE.hourWidth)
                    : String(TICK_STYLE.minuteWidth)
                }
                stroke-linecap="round"
              />
            );
          })}

          {Array.from({ length: 24 }, (_, index) => {
            const point = getPointOnCircle(index * 60, LABEL_RADIUS);
            const label = index === 0 ? "24" : String(index);

            return (
              <text
                key={`label-${label}`}
                x={point.x}
                y={point.y + LABEL_STYLE.dialHourBaselineOffset}
                paint-order="stroke fill"
                stroke={CLOCK_COLORS.dialTextStroke}
                stroke-width={String(LABEL_STYLE.dialHourStrokeWidth)}
                stroke-linejoin="round"
                fill={CLOCK_COLORS.dialText}
                font-size={String(LABEL_STYLE.dialHourSize)}
                font-weight="700"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {label}
              </text>
            );
          })}

          {routeLayers.map((routeLayer) => (
            <g key={`route-layer-${routeLayer.direction}`}>
              {routeLayer.entries.map((departure) => {
                const isNextDeparture =
                  routeLayer.nextDeparture?.time === departure.time;
                const tickInset = isNextDeparture
                  ? ROUTE_MARKER_STYLE.nextTickInset
                  : ROUTE_MARKER_STYLE.tickInset;
                const tickStart = getPointOnCircle(
                  departure.totalMinutes,
                  routeLayer.geometry.laneRadius - tickInset,
                );
                const tickEnd = getPointOnCircle(
                  departure.totalMinutes,
                  routeLayer.geometry.laneRadius + tickInset,
                );
                const tickOpacity =
                  departure.isPast && !isNextDeparture
                    ? ROUTE_MARKER_STYLE.pastTickOpacity
                    : ROUTE_MARKER_STYLE.tickOpacity;
                const labelPoint = getDepartureLabelPoint(
                  routeLayer,
                  departure,
                );
                const labelOpacity =
                  departure.isPast && !isNextDeparture
                    ? LABEL_STYLE.routePastOpacity
                    : LABEL_STYLE.routeBaseOpacity;
                const labelFontSize = routeLayer.geometry.labelFontSize;

                return (
                  <g key={`${routeLayer.direction}-${departure.time}`}>
                    {isNextDeparture && (
                      <line
                        x1={tickStart.x}
                        y1={tickStart.y}
                        x2={tickEnd.x}
                        y2={tickEnd.y}
                        stroke={routeLayer.theme.marker}
                        stroke-width={String(ROUTE_MARKER_STYLE.nextGlowWidth)}
                        stroke-linecap="round"
                        opacity={String(ROUTE_MARKER_STYLE.nextGlowOpacity)}
                      >
                        <animate
                          attributeName="opacity"
                          values={`${ROUTE_MARKER_STYLE.nextGlowOpacity};${NEXT_GLOW_ANIMATION.peakOpacity};${ROUTE_MARKER_STYLE.nextGlowOpacity}`}
                          dur={NEXT_GLOW_ANIMATION.duration}
                          begin={
                            routeLayer.direction === "retur"
                              ? NEXT_GLOW_ANIMATION.staggerDelay
                              : "0s"
                          }
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-width"
                          values={`${ROUTE_MARKER_STYLE.nextGlowWidth};${ROUTE_MARKER_STYLE.nextGlowWidth + NEXT_GLOW_ANIMATION.peakWidthOffset};${ROUTE_MARKER_STYLE.nextGlowWidth}`}
                          dur={NEXT_GLOW_ANIMATION.duration}
                          begin={
                            routeLayer.direction === "retur"
                              ? NEXT_GLOW_ANIMATION.staggerDelay
                              : "0s"
                          }
                          repeatCount="indefinite"
                        />
                      </line>
                    )}

                    <line
                      x1={tickStart.x}
                      y1={tickStart.y}
                      x2={tickEnd.x}
                      y2={tickEnd.y}
                      stroke={routeLayer.theme.marker}
                      stroke-width={
                        isNextDeparture
                          ? String(ROUTE_MARKER_STYLE.nextTickWidth)
                          : String(ROUTE_MARKER_STYLE.tickWidth)
                      }
                      stroke-linecap="round"
                      opacity={tickOpacity}
                    />

                    <text
                      x={labelPoint.x}
                      y={labelPoint.y + LABEL_STYLE.routeBaselineOffset}
                      paint-order="stroke fill"
                      stroke={CLOCK_COLORS.routeTextStroke}
                      stroke-width={
                        isNextDeparture
                          ? String(LABEL_STYLE.routeNextStrokeWidth)
                          : String(LABEL_STYLE.routeStrokeWidth)
                      }
                      stroke-linejoin="round"
                      fill={routeLayer.theme.marker}
                      opacity={isNextDeparture ? "1" : String(labelOpacity)}
                      font-size={String(labelFontSize)}
                      font-weight={isNextDeparture ? "800" : "700"}
                      text-anchor="middle"
                      dominant-baseline="middle"
                    >
                      {departure.minute}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          <circle
            cx={currentTimelinePoint.x}
            cy={currentTimelinePoint.y}
            r={String(CLOCK_LAYOUT.currentTimelineDotRadius)}
            fill={CLOCK_COLORS.hand}
            stroke={CLOCK_COLORS.surface}
            stroke-width={String(CLOCK_LAYOUT.currentTimelineDotStrokeWidth)}
          />

          <path
            d={currentHandPath}
            fill={CLOCK_COLORS.handShadow}
            opacity="0.08"
            transform={`translate(${HAND_STYLE.shadowTranslateX} ${HAND_STYLE.shadowTranslateY})`}
          />
          <path
            d={currentHandPath}
            fill={CLOCK_COLORS.hand}
            stroke={CLOCK_COLORS.surface}
            stroke-width={String(CLOCK_LAYOUT.currentHandStrokeWidth)}
            stroke-linejoin="round"
          />
          <circle
            cx={currentHandPoint.x}
            cy={currentHandPoint.y}
            r={String(CLOCK_LAYOUT.currentHandTipRadius)}
            fill={CLOCK_COLORS.currentTipFill}
            opacity={String(CLOCK_COLORS.currentTipOpacity)}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={String(CLOCK_LAYOUT.centerOuterRadius)}
            fill={CLOCK_COLORS.surface}
            opacity="0.92"
            stroke={CLOCK_COLORS.centerOuterStroke}
            stroke-width={String(CLOCK_LAYOUT.centerOuterStrokeWidth)}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={String(CLOCK_LAYOUT.centerInnerRadius)}
            fill={CLOCK_COLORS.centerInnerFill}
            stroke={CLOCK_COLORS.hand}
            stroke-width={String(CLOCK_LAYOUT.centerInnerStrokeWidth)}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={String(CLOCK_LAYOUT.centerCoreRadius)}
            fill={CLOCK_COLORS.hand}
          />
        </svg>
      </div>

      <div class="flex w-full flex-col gap-2 px-1 pb-1 sm:flex-row">
        {routeLayers.map((routeLayer) => (
          <div
            key={`summary-${routeLayer.direction}`}
            class={twMerge(
              "flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-3 py-2 shadow-sm shadow-slate-200/70 backdrop-blur-sm",
              routeLayer.theme.summaryBorder,
              routeLayer.theme.summarySurface,
            )}
          >
            <div class="min-w-0">
              <div
                class={twMerge(
                  "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  routeLayer.theme.legendBg,
                  routeLayer.theme.legendText,
                )}
              >
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: routeLayer.theme.marker }}
                />
                <span>{routeLayer.label}</span>
              </div>
            </div>

            <div class="flex items-baseline gap-2 whitespace-nowrap">
              <div
                class={twMerge(
                  "text-xl font-black tabular-nums tracking-tight",
                  routeLayer.theme.summaryText,
                )}
              >
                {routeLayer.nextDeparture?.time ?? "--:--"}
              </div>
              <div
                class={twMerge(
                  "text-xs font-semibold uppercase tracking-[0.16em]",
                  routeLayer.theme.summaryMuted,
                )}
              >
                {getCompactNextDepartureSummary(routeLayer.nextDeparture)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
