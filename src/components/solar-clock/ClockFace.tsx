import { JSX } from "preact";

import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  FACE_RADIUS,
  LABEL_RADIUS,
  LABEL_STYLE,
  TICK_INNER_RADIUS,
  TICK_OUTER_RADIUS,
  TICK_STYLE,
  getPointOnCircle,
} from "./constants";

interface ClockFaceBackgroundProps {
  clockFaceId: string;
}

export function ClockFaceBackground({ clockFaceId }: ClockFaceBackgroundProps): JSX.Element {
  return (
    <circle
      cx={CENTER}
      cy={CENTER}
      r={FACE_RADIUS}
      fill={`url(#${clockFaceId})`}
      stroke={CLOCK_COLORS.faceStroke}
      stroke-width="2"
    />
  );
}

export function ClockFaceLabels(): JSX.Element {
  return (
    <>
      {Array.from({ length: 24 }, (_, index) => {
        const minuteValue = index * 60 + 30;
        const start = getPointOnCircle(
          minuteValue,
          TICK_INNER_RADIUS + CLOCK_LAYOUT.minorTickInset,
        );
        const end = getPointOnCircle(minuteValue, TICK_OUTER_RADIUS);

        return (
          <line
            key={`tick-${minuteValue}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={CLOCK_COLORS.tickMinor}
            stroke-width={String(TICK_STYLE.minuteWidth)}
            stroke-linecap="round"
          />
        );
      })}

      {Array.from({ length: 24 }, (_, index) => {
        const point = getPointOnCircle(index * 60, LABEL_RADIUS);
        const label = String(index);

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
    </>
  );
}
