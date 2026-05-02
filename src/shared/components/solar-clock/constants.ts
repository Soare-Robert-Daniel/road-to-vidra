import {
  MINUTES_PER_DAY,
  timeToClockAngle,
  type NextDeparture,
  type SolarTimesSummary,
} from "../../utils/solar";
import { formatTimeDifference, timeToMinutes } from "../../utils/utils";

export type Direction = "tur" | "retur";

interface RouteGeometry {
  laneRadius: number;
  guideDash: string;
  labelRadius: number;
  denseLabelRadius: number;
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

export interface RouteEntry {
  index: number;
  time: string;
  minute: string;
  totalMinutes: number;
  isDaylight: boolean;
  isPast: boolean;
}

export interface RouteLayer {
  direction: Direction;
  label: string;
  entries: RouteEntry[];
  nextDeparture: NextDeparture | null;
  upcomingDepartures: NextDeparture[];
  theme: RouteTheme;
  geometry: RouteGeometry;
}

export interface PosterSection {
  id: "noapte" | "dimineata" | "dupa-amiaza" | "seara";
  label: string;
  startMinutes: number;
  endMinutes: number;
  hourRange: string;
  turEntries: RouteEntry[];
  returEntries: RouteEntry[];
  containsNow: boolean;
  isDaylight: boolean;
  titleColor: string;
  bgColor: string;
}

export const POSTER_SECTION_DEFS = [
  {
    id: "noapte" as const,
    label: "Noapte",
    startMinutes: 0,
    endMinutes: 360,
    hourRange: "00:00 – 06:00",
    isDaylight: false,
    titleColor: "var(--color-section-noapte)",
    bgColor: "var(--color-bg-noapte)",
  },
  {
    id: "dimineata" as const,
    label: "Dimineata",
    startMinutes: 360,
    endMinutes: 720,
    hourRange: "06:00 – 12:00",
    isDaylight: true,
    titleColor: "var(--color-section-dimineata)",
    bgColor: "var(--color-bg-dimineata)",
  },
  {
    id: "dupa-amiaza" as const,
    label: "Dupa-amiaza",
    startMinutes: 720,
    endMinutes: 1080,
    hourRange: "12:00 – 18:00",
    isDaylight: true,
    titleColor: "var(--color-section-dupa-amiaza)",
    bgColor: "var(--color-bg-dupa-amiaza)",
  },
  {
    id: "seara" as const,
    label: "Seara",
    startMinutes: 1080,
    endMinutes: 1440,
    hourRange: "18:00 – 00:00",
    isDaylight: false,
    titleColor: "var(--color-section-seara)",
    bgColor: "var(--color-bg-seara)",
  },
] as const;

// Temperature wave label configuration
export const TEMP_LABEL_CONFIG = {
  tempFontSize: 14,
  tempFontWeight: "700",
  tempOffsetY: -10, // above the point
  hourFontSize: 10,
  hourFontWeight: "400",
  hourOffsetY: 16, // below the point (positive = downward)
  dotRadius: 3,
  dotStrokeWidth: 1.5,
};

// SVG canvas and geometric dimensions for the clock face layout
export const CLOCK_LAYOUT = {
  size: 560,
  faceRadius: 255,
  timelineRadius: 122,
  timelineWidth: 24,
  timelineFrameOffset: 2,
  timelineHaloOffset: 10,
  dialLabelRadius: 236,
  tickInnerRadius: 225,
  tickOuterRadius: 247,
  minorTickInset: 8,
  currentHandLength: 196,
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

// Styling for the sunrise-to-sunset band on the clock
export const SOLAR_BAND_STYLE = {
  radius: 263,
  width: 2.5,
  dayColor: "var(--color-solar-day)",
  nightColor: "var(--color-solar-night)",
  dayOpacity: 1,
  nightOpacity: 0.8,
  markerRadius: 3.5,
  markerColor: "var(--color-solar-marker)",
  markerOpacity: 1,
} as const;

// SVG path geometry properties for the clock hand (current time indicator)
export const HAND_STYLE = {
  baseWidth: 8,
  tipWidth: 3.2,
  shoulderInset: 14,
  tailWidthRatio: 0.72,
  shadowTranslateX: 1.8,
  shadowTranslateY: 2.2,
} as const;

// Hour and minute tick marks on the clock perimeter
export const TICK_STYLE = {
  hourWidth: 3.5,
  minuteWidth: 2,
} as const;

// Text rendering and opacity for hour/route departure labels
export const LABEL_STYLE = {
  dialHourSize: 34,
  dialHourStrokeWidth: 6.5,
  dialHourBaselineOffset: 2,
  intermediateHourRadiusOffset: 20,
  intermediateHourSizeRatio: 0.7,
  intermediateHourWeight: 500,
  intermediateHourOpacity: 0.8,
  intermediateHourColor: "var(--color-label-intermediate)",
  routeBaseOpacity: 0.96,
  routePastOpacity: 0.3,
  routeStrokeWidth: 4,
  routeNextStrokeWidth: 5,
  routeBaselineOffset: 1.5,
} as const;

// Curved direction labels in the empty 0–5h zone of the clock face
export const LEGEND_STYLE = {
  arcStartMinutes: 30,
  arcEndMinutes: 270,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 1.5,
  opacity: 0.5,
} as const;

// Visual styling for route departure markers (guides, segments, ticks, glows)
export const ROUTE_MARKER_STYLE = {
  guideWidth: 1.2,
  guideOpacity: 0.55,
  segmentWidth: 5.2,
  pastSegmentMultiplier: 0.3,
  tickInset: 7,
  nextTickInset: 12,
  tickOpacity: 0.9,
  pastTickOpacity: 0.2,
  tickWidth: 3.1,
  nextTickWidth: 5.4,
  nextGlowWidth: 12,
  nextGlowOpacity: 0.16,
} as const;

// Animation properties for the pulsing glow effect on the next departure indicator
export const NEXT_GLOW_ANIMATION = {
  duration: "4.2s",
  staggerDelay: "2.1s",
  peakOpacity: 0.28,
  peakWidthOffset: 3,
} as const;

// Drop shadow effect properties for depth and visual emphasis
export const SHADOW_STYLE = {
  offsetY: 14,
  blur: 18,
} as const;

// RGB/hex color palette for the entire clock visualization
export const CLOCK_COLORS = {
  hand: "var(--color-clock-hand)",
  handShadow: "var(--color-clock-hand-shadow)",
  currentRingIndicator: "var(--color-clock-hand-shadow)",
  surface: "var(--color-clock-surface)",
  faceGradientStart: "var(--color-clock-surface)",
  faceGradientMid: "var(--color-clock-face-mid)",
  faceGradientEnd: "var(--color-clock-face-end)",
  faceStroke: "var(--color-clock-face-stroke)",
  timelineFrame: "var(--color-clock-timeline-frame)",
  timelineBase: "var(--color-clock-timeline-base)",
  tickMajor: "var(--color-clock-tick-major)",
  tickMinor: "var(--color-clock-tick-minor)",
  dialText: "var(--color-clock-dial-text)",
  dialTextStroke: "oklch(1 0 0 / 0.9)",
  routeTextStroke: "oklch(1 0 0 / 0.95)",
  shadowColor: "var(--color-clock-shadow)",
  shadowOpacity: 0.18,
  shadowSurfaceOpacity: 0.92,
  currentTipFill: "var(--color-clock-surface)",
  currentTipOpacity: 0.9,
  centerOuterStroke: "var(--color-clock-center-outer)",
  centerInnerFill: "var(--color-clock-center-inner)",
} as const;

// Derived convenience constants extracted from CLOCK_LAYOUT
export const CLOCK_SIZE = CLOCK_LAYOUT.size;
export const CENTER = CLOCK_SIZE / 2;
export const FACE_RADIUS = CLOCK_LAYOUT.faceRadius;
export const LABEL_RADIUS = CLOCK_LAYOUT.dialLabelRadius;
export const TICK_INNER_RADIUS = CLOCK_LAYOUT.tickInnerRadius;
export const TICK_OUTER_RADIUS = CLOCK_LAYOUT.tickOuterRadius;
export const CURRENT_HAND_LENGTH = CLOCK_LAYOUT.currentHandLength;
export const CURRENT_HAND_TAIL = CLOCK_LAYOUT.currentHandTail;

// Color and styling themes for each bus route (420, 438, default); tur/retur directions have different color schemes
const BUS_ROUTE_THEMES: Record<string, Record<Direction, RouteTheme>> = {
  "420": {
    tur: {
      marker: "var(--color-route-420-tur)",
      markerSoft: "var(--color-route-420-tur-soft)",
      legendBg: "bg-blue-50/80",
      legendText: "text-blue-800",
      summaryBorder: "border-blue-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-blue-950",
      summaryMuted: "text-blue-800",
    },
    retur: {
      marker: "var(--color-route-420-retur)",
      markerSoft: "var(--color-route-420-retur-soft)",
      legendBg: "bg-amber-50/80",
      legendText: "text-amber-800",
      summaryBorder: "border-amber-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-amber-950",
      summaryMuted: "text-amber-800",
    },
  },
  default: {
    tur: {
      marker: "var(--color-route-default-tur)",
      markerSoft: "var(--color-route-default-tur-soft)",
      legendBg: "bg-cyan-50/80",
      legendText: "text-cyan-800",
      summaryBorder: "border-cyan-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-cyan-950",
      summaryMuted: "text-cyan-800",
    },
    retur: {
      marker: "var(--color-route-default-retur)",
      markerSoft: "var(--color-route-default-retur-soft)",
      legendBg: "bg-pink-50/80",
      legendText: "text-pink-800",
      summaryBorder: "border-pink-200/80",
      summarySurface: "bg-white/80",
      summaryText: "text-pink-950",
      summaryMuted: "text-pink-800",
    },
  },
};

// Geometric radii and properties for positioning departure labels on tur (outbound) and retur (return) routes
export const ROUTE_GEOMETRY: Record<Direction, RouteGeometry> = {
  tur: {
    laneRadius: 180,
    guideDash: "2 8",
    labelRadius: 163,
    denseLabelRadius: 159,
    labelFontSize: 22,
  },
  retur: {
    laneRadius: 210,
    guideDash: "2 10",
    labelRadius: 195,
    denseLabelRadius: 204,
    labelFontSize: 22,
  },
};

// --- Utility functions ---

export function getPointOnCircle(minutes: number, radius: number) {
  const angle = (timeToClockAngle(minutes) * Math.PI) / 180;

  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

export function getArcPath(startMinutes: number, endMinutes: number, radius: number) {
  const startPoint = getPointOnCircle(startMinutes, radius);
  const endPoint = getPointOnCircle(endMinutes, radius);
  const spanMinutes =
    (((endMinutes - startMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const largeArcFlag = spanMinutes > MINUTES_PER_DAY / 2 ? 1 : 0;

  return [
    `M ${startPoint.x} ${startPoint.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`,
  ].join(" ");
}

export function getTimeParts(time: string) {
  const [, minutePart] = time.split(":");

  return {
    minute: minutePart.padStart(2, "0"),
    totalMinutes: timeToMinutes(time),
  };
}

export function getHandPath(
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

export function getClockTheme(busNumber: string, direction: Direction) {
  const busThemes = BUS_ROUTE_THEMES[busNumber] ?? BUS_ROUTE_THEMES.default;

  return busThemes[direction];
}

export function getRouteLegendLabel(direction: Direction, station: string): string {
  const destinationMatch = station.match(/^Spre\s+(.+?)(?:\s+din|$)/i);
  const destination = destinationMatch?.[1] ?? station;

  return `${direction === "tur" ? "Tur" : "Retur"} · ${destination}`;
}

export function isDepartureInDaylight(
  totalMinutes: number,
  solarTimes: SolarTimesSummary,
): boolean {
  return totalMinutes >= solarTimes.sunriseMinutes && totalMinutes < solarTimes.sunsetMinutes;
}

export function getNextDepartureSummary(nextDeparture: NextDeparture | null): string {
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

export function getHeadwayOpacity(spanMinutes: number): number {
  if (spanMinutes <= 35) {
    return 0.38;
  }

  if (spanMinutes <= 60) {
    return 0.28;
  }

  return 0.18;
}

function getDepartureLabelRadius(routeLayer: RouteLayer, departure: RouteEntry): number {
  const previousDeparture = routeLayer.entries[departure.index - 1];
  const upcomingDeparture = routeLayer.entries[departure.index + 1];
  const previousGap = previousDeparture
    ? departure.totalMinutes - previousDeparture.totalMinutes
    : Number.POSITIVE_INFINITY;
  const nextGap = upcomingDeparture
    ? upcomingDeparture.totalMinutes - departure.totalMinutes
    : Number.POSITIVE_INFINITY;
  const isDenseCluster = Math.min(previousGap, nextGap) <= 42;

  if (!isDenseCluster || departure.index % 2 === 0) {
    return routeLayer.geometry.labelRadius;
  }

  return routeLayer.geometry.denseLabelRadius;
}

export function getDepartureLabelPoint(routeLayer: RouteLayer, departure: RouteEntry) {
  const labelRadius = getDepartureLabelRadius(routeLayer, departure);

  return getPointOnCircle(departure.totalMinutes, labelRadius);
}
