import { JSX } from "preact";

import {
  CENTER,
  CLOCK_COLORS,
  CLOCK_LAYOUT,
  FACE_RADIUS,
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

const CARDINAL_HOURS = [0, 6, 12, 18];
const CARDINAL_LABEL_RADIUS = TICK_OUTER_RADIUS + 18;

export function ClockFaceLabels(): JSX.Element {
  return (
    <>
      {Array.from({ length: 288 }, (_, index) => {
        const minutes = index * 5;
        const isHour = minutes % 60 === 0;
        const isCardinal = isHour && CARDINAL_HOURS.includes(minutes / 60);
        const isHalfHour = minutes % 30 === 0;
        const isQuarterHour = minutes % 15 === 0;

        let strokeWidth: number;
        let stroke: string;
        let innerRadius = TICK_INNER_RADIUS;
        let outerRadius = TICK_OUTER_RADIUS;

        if (isHour) {
          strokeWidth = isCardinal ? 4.5 : TICK_STYLE.hourWidth;
          stroke = CLOCK_COLORS.dialText;
        } else if (isHalfHour || isQuarterHour) {
          strokeWidth = TICK_STYLE.minuteWidth;
          stroke = CLOCK_COLORS.tickMinor;
          innerRadius += CLOCK_LAYOUT.minorTickInset;
        } else {
          strokeWidth = 1.2;
          stroke = CLOCK_COLORS.tickMinor;
          innerRadius += CLOCK_LAYOUT.minorTickInset + 4;
          outerRadius -= 4;
        }

        const start = getPointOnCircle(minutes, innerRadius);
        const end = getPointOnCircle(minutes, outerRadius);

        return (
          <line
            key={`tick-${minutes}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={stroke}
            stroke-width={String(strokeWidth)}
            stroke-linecap="round"
            opacity={!isHour && !isHalfHour && !isQuarterHour ? 0.5 : undefined}
          />
        );
      })}

      {CARDINAL_HOURS.map((hour) => {
        const point = getPointOnCircle(hour * 60, CARDINAL_LABEL_RADIUS);

        return (
          <text
            key={`label-${hour}`}
            x={point.x}
            y={point.y + LABEL_STYLE.dialHourBaselineOffset}
            paint-order="stroke fill"
            stroke={CLOCK_COLORS.dialTextStroke}
            stroke-width={String(LABEL_STYLE.dialHourStrokeWidth)}
            stroke-linejoin="round"
            fill={CLOCK_COLORS.dialText}
            font-family="'Space Grotesk Variable', sans-serif"
            font-size={String(LABEL_STYLE.dialHourSize)}
            font-weight="700"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {String(hour)}
          </text>
        );
      })}
    </>
  );
}

