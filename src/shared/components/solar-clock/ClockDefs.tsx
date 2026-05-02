import { JSX } from "preact";

import { CLOCK_COLORS, SHADOW_STYLE } from "./constants";

interface ClockDefsProps {
  clockFaceId: string;
  shadowId: string;
}

export function ClockDefs({ clockFaceId, shadowId }: ClockDefsProps): JSX.Element {
  return (
    <defs>
      <radialGradient id={clockFaceId} cx="50%" cy="42%" r="72%">
        <stop offset="0%" stop-color={CLOCK_COLORS.faceGradientStart} />
        <stop offset="72%" stop-color={CLOCK_COLORS.faceGradientMid} />
        <stop offset="100%" stop-color={CLOCK_COLORS.faceGradientEnd} />
      </radialGradient>
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
