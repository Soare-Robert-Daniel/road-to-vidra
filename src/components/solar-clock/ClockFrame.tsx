import { JSX } from "preact";

import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  CURRENT_TIME_RING_STYLE,
  TIMELINE_RADIUS,
  TIMELINE_WIDTH,
  getPointOnCircle,
} from "./constants";

interface ClockFrameProps {
  shadowId: string;
  currentMinutes: number;
}

export function ClockFrame({
  shadowId,
  currentMinutes,
}: ClockFrameProps): JSX.Element {
  const currentMinuteRingStart = getPointOnCircle(
    currentMinutes,
    TIMELINE_RADIUS - TIMELINE_WIDTH / 2 - CURRENT_TIME_RING_STYLE.overhang,
  );
  const currentMinuteRingEnd = getPointOnCircle(
    currentMinutes,
    TIMELINE_RADIUS + TIMELINE_WIDTH / 2 + CURRENT_TIME_RING_STYLE.overhang,
  );

  return (
    <>
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
    </>
  );
}
