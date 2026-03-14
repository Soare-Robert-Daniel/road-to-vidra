import { JSX } from "preact";

import {
  CLOCK_COLORS,
  SHADOW_STYLE,
} from "./constants";

interface ClockDefsProps {
  clockFaceId: string;
  daylightId: string;
  shadowId: string;
}

/**
 * Defines SVG gradients and filters used throughout the clock.
 * 
 * Does not render visual elements itself, but defines:
 * - Radial gradient for clock face background (white → light blue)
 * - Linear gradient for daylight band (yellow → orange)
 * - Drop shadow filter for depth effect beneath the clock
 */
export function ClockDefs({
  clockFaceId,
  daylightId,
  shadowId,
}: ClockDefsProps): JSX.Element {
  return (
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
  );
}
