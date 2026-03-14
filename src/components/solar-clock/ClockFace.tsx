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

interface ClockFaceProps {
  clockFaceId: string;
}

export function ClockFace({ clockFaceId }: ClockFaceProps): JSX.Element {
  return (
    <>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={FACE_RADIUS}
        fill={`url(#${clockFaceId})`}
        stroke={CLOCK_COLORS.faceStroke}
        stroke-width="2"
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
    </>
  );
}
