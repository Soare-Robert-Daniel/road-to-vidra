import { JSX } from "preact";
import type { HourlyTemperature } from "../../hooks/useWeatherData";
import { TEMP_LABEL_CONFIG } from "./constants";

interface TemperatureWaveProps {
  temperatures: HourlyTemperature[];
  currentMinutes: number;
}

const WIDTH = 480;
const HEIGHT = 128; // increased for better label spacing
const PAD_LEFT = 16;
const PAD_RIGHT = 16;
const CHART_TOP = 36;
const CHART_BOTTOM = 100;
const CHART_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

const COLORS = {
  stroke: "var(--color-temp-stroke)",
  fillStart: "var(--color-temp-fill-start)",
  fillEnd: "var(--color-temp-fill-end)",
  label: "var(--color-temp-label)",
  accent: "var(--color-clock-hand)",
};

// OKLCH color stops: [temp °C, lightness, chroma, hue]
const TEMP_COLOR_STOPS: Array<[number, number, number, number]> = [
  [0, 0.55, 0.1, 250], // deep blue
  [10, 0.6, 0.1, 200], // cyan/teal
  [20, 0.62, 0.12, 145], // green
  [30, 0.62, 0.14, 65], // orange
  [35, 0.55, 0.16, 25], // red
];

function temperatureToColor(temp: number): string {
  if (temp <= TEMP_COLOR_STOPS[0][0]) {
    const [, l, c, h] = TEMP_COLOR_STOPS[0];
    return `oklch(${l} ${c} ${h})`;
  }
  for (let i = 1; i < TEMP_COLOR_STOPS.length; i++) {
    if (temp <= TEMP_COLOR_STOPS[i][0]) {
      const [t0, l0, c0, h0] = TEMP_COLOR_STOPS[i - 1];
      const [t1, l1, c1, h1] = TEMP_COLOR_STOPS[i];
      const t = (temp - t0) / (t1 - t0);
      const l = l0 + t * (l1 - l0);
      const c = c0 + t * (c1 - c0);
      const h = h0 + t * (h1 - h0);
      return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
    }
  }
  const [, l, c, h] = TEMP_COLOR_STOPS[TEMP_COLOR_STOPS.length - 1];
  return `oklch(${l} ${c} ${h})`;
}

function buildMonotonePath(points: Array<{ x: number; y: number }>): string {
  const n = points.length;
  if (n < 2) return "";

  const deltas: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    deltas.push(points[i + 1].x - points[i].x);
    slopes.push((points[i + 1].y - points[i].y) / deltas[i]);
  }

  const tangents = Array.from({ length: n }, () => 0);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2;
    }
  }

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = deltas[i] / 3;
    const cp1x = points[i].x + dx;
    const cp1y = points[i].y + tangents[i] * dx;
    const cp2x = points[i + 1].x - dx;
    const cp2y = points[i + 1].y - tangents[i + 1] * dx;
    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${points[i + 1].x.toFixed(1)},${points[i + 1].y.toFixed(1)}`;
  }
  return path;
}

function interpolateY(points: Array<{ x: number; y: number }>, targetX: number): number {
  if (targetX <= points[0].x) return points[0].y;
  if (targetX >= points[points.length - 1].x) return points[points.length - 1].y;

  for (let i = 0; i < points.length - 1; i++) {
    if (targetX >= points[i].x && targetX <= points[i + 1].x) {
      const t = (targetX - points[i].x) / (points[i + 1].x - points[i].x);
      return points[i].y + t * (points[i + 1].y - points[i].y);
    }
  }
  return points[0].y;
}

export function TemperatureWave({
  temperatures,
  currentMinutes,
}: TemperatureWaveProps): JSX.Element | null {
  if (!temperatures || temperatures.length < 2) return null;

  const temps = temperatures.map((t) => t.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  const points = temperatures.map((t, i) => ({
    x: PAD_LEFT + (i / (temperatures.length - 1)) * CHART_WIDTH,
    y: CHART_BOTTOM - ((t.temperature - minTemp) / range) * CHART_HEIGHT,
  }));

  const strokePath = buildMonotonePath(points);
  const fillPath = `${strokePath} L ${points[points.length - 1].x},${CHART_BOTTOM} L ${points[0].x},${CHART_BOTTOM} Z`;

  // Current time position
  const currentHourFraction = currentMinutes / 60;
  const firstHourNum = Number.parseInt(temperatures[0].hour, 10);
  let hoursFromStart = currentHourFraction - firstHourNum;
  if (hoursFromStart < 0) hoursFromStart += 24;
  const currentX = PAD_LEFT + (hoursFromStart / (temperatures.length - 1)) * CHART_WIDTH;
  const currentY = interpolateY(points, currentX);
  const showTimeLine = currentX >= PAD_LEFT && currentX <= PAD_LEFT + CHART_WIDTH;

  // On-curve labels every 3 hours
  const curveLabels: Array<{
    x: number;
    y: number;
    hour: string;
    temp: string;
    color: string;
    isNow: boolean;
  }> = [];
  for (let i = 0; i < temperatures.length; i += 3) {
    const pt = points[i];
    curveLabels.push({
      x: Math.max(PAD_LEFT + 12, Math.min(pt.x, WIDTH - PAD_RIGHT - 12)),
      y: pt.y,
      hour: i === 0 ? "Acum" : temperatures[i].hour,
      temp: `${Math.round(temperatures[i].temperature)}\u00B0`,
      color: temperatureToColor(temperatures[i].temperature),
      isNow: i === 0,
    });
  }

  return (
    <div class="w-full rounded-2xl">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        class="block w-full"
        aria-label="Temperatura urmatoarele 24 ore"
        role="img"
      >
        <defs>
          <linearGradient
            id="tempFillGrad"
            x1="0"
            y1={String(CHART_TOP)}
            x2="0"
            y2={String(CHART_BOTTOM)}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color={COLORS.fillStart} />
            <stop offset="100%" stop-color={COLORS.fillEnd} />
          </linearGradient>
        </defs>

        {/* Filled area */}
        <path d={fillPath} fill="url(#tempFillGrad)" />

        {/* Stroke line */}
        <path
          d={strokePath}
          fill="none"
          stroke={COLORS.stroke}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {/* Current time indicator */}
        {showTimeLine && (
          <>
            <line
              x1={currentX}
              y1={CHART_TOP}
              x2={currentX}
              y2={CHART_BOTTOM}
              stroke={COLORS.accent}
              stroke-width="0.75"
              stroke-dasharray="3 2"
              opacity="0.4"
            />
            <circle cx={currentX} cy={currentY} r="3.5" fill={COLORS.accent} />
          </>
        )}

        {/* Temperature labels (above) and hour labels (below) */}
        {curveLabels.map((label) => (
          <g key={label.hour}>
            {/* Hollow dot */}
            <circle
              cx={label.x}
              cy={label.y}
              r={label.isNow ? 4 : TEMP_LABEL_CONFIG.dotRadius}
              fill="white"
              stroke={label.isNow ? COLORS.accent : label.color}
              stroke-width={TEMP_LABEL_CONFIG.dotStrokeWidth}
            />
            {/* Temperature above */}
            <text
              x={label.x}
              y={label.y + TEMP_LABEL_CONFIG.tempOffsetY}
              text-anchor="middle"
              fill={label.isNow ? COLORS.accent : label.color}
              font-family="var(--font-display)"
              font-size={TEMP_LABEL_CONFIG.tempFontSize}
              font-weight={TEMP_LABEL_CONFIG.tempFontWeight}
            >
              {label.temp}
            </text>
            {/* Hour below */}
            <text
              x={label.x}
              y={label.y + TEMP_LABEL_CONFIG.hourOffsetY}
              text-anchor="middle"
              fill={COLORS.label}
              font-family="var(--font-ui)"
              font-size={TEMP_LABEL_CONFIG.hourFontSize}
              font-weight={TEMP_LABEL_CONFIG.hourFontWeight}
            >
              {label.hour}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
