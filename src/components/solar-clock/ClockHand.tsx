import { JSX } from "preact";

import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  CURRENT_HAND_LENGTH,
  CURRENT_HAND_TAIL,
  HAND_STYLE,
  SOLAR_BAND_STYLE,
  getHandPath,
  getPointOnCircle,
} from "./constants";

interface ClockHandProps {
  currentMinutes: number;
}

/**
 * Renders the current time hand and center pivot point.
 *
 * Draws:
 * - Dot on the timeline indicating current time
 * - Tapered hand pointing from center outward to the current time (with shadow)
 * - White circle at the tip of the hand
 * - Multi-ring center pivot point (outer ring, inner ring, and core circle)
 */
export function ClockHand({ currentMinutes }: ClockHandProps): JSX.Element {
  const currentHandPoint = getPointOnCircle(currentMinutes, CURRENT_HAND_LENGTH);
  const currentTimelinePoint = getPointOnCircle(currentMinutes, SOLAR_BAND_STYLE.radius);
  const currentHandPath = getHandPath(
    currentMinutes,
    CURRENT_HAND_LENGTH,
    CURRENT_HAND_TAIL,
    HAND_STYLE.baseWidth,
    HAND_STYLE.tipWidth,
  );

  return (
    <>
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
    </>
  );
}
