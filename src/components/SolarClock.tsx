import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { useCurrentTime } from "../hooks/useCurrentTime";
import {
  getNextDeparture,
  getSolarTimes,
  minutesToTimeLabel,
  timeToClockAngle,
} from "../solar";
import { timeToMinutes } from "../utils";

interface SolarClockProps {
  hours: string[];
  useWeekendSchedule: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

const CLOCK_SIZE = 360;
const CENTER = CLOCK_SIZE / 2;
const DAYLIGHT_RADIUS = 132;
const LABEL_RADIUS = 108;
const TICK_INNER_RADIUS = 120;
const TICK_OUTER_RADIUS = 138;
const DEPARTURE_GUIDE_RADIUS = 156;
const DEPARTURE_DOT_RADIUS = 156;
const DEPARTURE_LABEL_RADIUS = 168;
const CURRENT_HAND_LENGTH = 82;
const CURRENT_HAND_TAIL = 14;
const MINUTES_PER_DAY = 24 * 60;

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
  const [hourPart, minutePart] = time.split(":");

  return {
    hour: hourPart,
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
  const shoulderDistance = length - 14;
  const tailWidth = baseWidth * 0.72;

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

function getClockTheme(busNumber: string, direction: string) {
  if (busNumber === "420") {
    return direction === "tur"
      ? {
          marker: "#2563eb",
          markerSoft: "#93c5fd",
          face: "#f8fbff",
          hand: "#1d4ed8",
        }
      : {
          marker: "#059669",
          markerSoft: "#86efac",
          face: "#f8fffb",
          hand: "#047857",
        };
  }

  return direction === "tur"
    ? {
        marker: "#dc2626",
        markerSoft: "#fca5a5",
        face: "#fff9f8",
        hand: "#b91c1c",
      }
    : {
        marker: "#7c3aed",
        markerSoft: "#c4b5fd",
        face: "#fbf9ff",
        hand: "#6d28d9",
      };
}

export function SolarClock({
  hours,
  useWeekendSchedule,
  busNumber,
  direction,
  className,
}: SolarClockProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();
  const now = new Date(currentTimeSignal.value);
  const solarTimes = getSolarTimes(now);
  const nextDeparture = getNextDeparture(hours, useWeekendSchedule, now);
  const theme = getClockTheme(busNumber, direction);
  const departureEntries = hours.map((hour, index) => ({
    index,
    time: hour,
    ...getTimeParts(hour),
  }));
  const daylightArcPath = getArcPath(
    solarTimes.sunriseMinutes,
    solarTimes.sunsetMinutes,
    DAYLIGHT_RADIUS,
  );
  const currentHandPoint = getPointOnCircle(
    solarTimes.currentMinutes,
    CURRENT_HAND_LENGTH,
  );
  const currentHandPath = getHandPath(
    solarTimes.currentMinutes,
    CURRENT_HAND_LENGTH,
    CURRENT_HAND_TAIL,
    4.5,
    1.8,
  );
  const sunrisePoint = getPointOnCircle(
    solarTimes.sunriseMinutes,
    DAYLIGHT_RADIUS,
  );
  const sunsetPoint = getPointOnCircle(
    solarTimes.sunsetMinutes,
    DAYLIGHT_RADIUS,
  );
  const accessibilityLabel = [
    `Ceas solar pentru curse`,
    `rasarit ${minutesToTimeLabel(solarTimes.sunriseMinutes)}`,
    `apus ${minutesToTimeLabel(solarTimes.sunsetMinutes)}`,
    `ora curenta ${minutesToTimeLabel(solarTimes.currentMinutes)}`,
    `urmatoarea cursa ${nextDeparture?.time ?? "indisponibila"}`,
  ].join(", ");

  return (
    <div class={twMerge("mx-auto w-full max-w-72", className)}>
      <div class="mx-auto w-full max-w-72">
        <svg
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          class="mx-auto block w-full max-w-72"
          aria-label={accessibilityLabel}
          role="img"
        >
          <defs>
            <linearGradient
              id={`clockFace-${busNumber}-${direction}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color={theme.face} />
              <stop offset="100%" stop-color="#ffffff" />
            </linearGradient>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r="148"
            fill={`url(#clockFace-${busNumber}-${direction})`}
            stroke="#d9e1ec"
            stroke-width="2"
          />

          <circle
            cx={CENTER}
            cy={CENTER}
            r={DAYLIGHT_RADIUS}
            fill="none"
            stroke="#cbd5e1"
            stroke-width="14"
            stroke-linecap="round"
          />
          <path
            d={daylightArcPath}
            fill="none"
            stroke="#e6b84d"
            stroke-width="14"
            stroke-linecap="round"
          />

          {Array.from({ length: 48 }, (_, index) => {
            const minuteValue = index * 30;
            const isHourMark = minuteValue % 60 === 0;
            const start = getPointOnCircle(
              minuteValue,
              isHourMark ? TICK_INNER_RADIUS : TICK_INNER_RADIUS + 6,
            );
            const end = getPointOnCircle(minuteValue, TICK_OUTER_RADIUS);

            return (
              <line
                key={`tick-${minuteValue}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isHourMark ? "#94a3b8" : "#cbd5e1"}
                stroke-width={isHourMark ? "2.6" : "1.4"}
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
                y={point.y + 1}
                fill="#0f172a"
                font-size="12"
                font-weight="600"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {label}
              </text>
            );
          })}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={DEPARTURE_GUIDE_RADIUS}
            fill="none"
            stroke={theme.markerSoft}
            stroke-width="1.5"
            stroke-dasharray="2 8"
            opacity="0.55"
          />

          {departureEntries.map((departure) => {
            const isNextDeparture = nextDeparture?.time === departure.time;
            const dotPoint = getPointOnCircle(
              departure.totalMinutes,
              DEPARTURE_DOT_RADIUS,
            );
            const labelRadius = isNextDeparture
              ? DEPARTURE_LABEL_RADIUS + 12
              : DEPARTURE_LABEL_RADIUS + (departure.index % 2 === 0 ? 0 : 4);
            const labelPoint = getPointOnCircle(
              departure.totalMinutes,
              labelRadius,
            );
            const labelText = isNextDeparture
              ? departure.time
              : departure.minute;

            return (
              <g key={`departure-${departure.time}`}>
                {isNextDeparture && (
                  <>
                    <circle
                      cx={dotPoint.x}
                      cy={dotPoint.y}
                      r="7"
                      fill="none"
                      stroke={theme.marker}
                      stroke-width="1.8"
                      opacity="0.24"
                    >
                      <animate
                        attributeName="r"
                        values="7;11;15"
                        dur="3.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.24;0.09;0"
                        dur="3.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={dotPoint.x}
                      cy={dotPoint.y}
                      r="7"
                      fill="none"
                      stroke={theme.marker}
                      stroke-width="1.2"
                      opacity="0.18"
                    >
                      <animate
                        attributeName="r"
                        values="7;10;13"
                        dur="3.6s"
                        begin="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.18;0.07;0"
                        dur="3.6s"
                        begin="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                <circle
                  cx={dotPoint.x}
                  cy={dotPoint.y}
                  r={isNextDeparture ? "4.5" : "3.2"}
                  fill={isNextDeparture ? theme.marker : theme.marker}
                  opacity={isNextDeparture ? "1" : "0.72"}
                  stroke="#ffffff"
                  stroke-width={isNextDeparture ? "2" : "1.4"}
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 0.5}
                  fill={isNextDeparture ? theme.marker : "#475569"}
                  font-size={isNextDeparture ? "11" : "8.5"}
                  font-weight={isNextDeparture ? "700" : "600"}
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          <circle
            cx={sunrisePoint.x}
            cy={sunrisePoint.y}
            r="4"
            fill="#ffffff"
            stroke="#e6b84d"
            stroke-width="2.5"
          />
          <circle
            cx={sunsetPoint.x}
            cy={sunsetPoint.y}
            r="4"
            fill="#ffffff"
            stroke="#e6b84d"
            stroke-width="2.5"
          />

          <path
            d={currentHandPath}
            fill="#0f172a"
            opacity="0.08"
            transform="translate(1.4 1.8)"
          />
          <path
            d={currentHandPath}
            fill={theme.hand}
            stroke="#ffffff"
            stroke-width="1.2"
            stroke-linejoin="round"
          />
          <circle
            cx={currentHandPoint.x}
            cy={currentHandPoint.y}
            r="2.4"
            fill="#ffffff"
            opacity="0.9"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r="15"
            fill="#ffffff"
            opacity="0.92"
            stroke="#d8e1ec"
            stroke-width="1.4"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r="8"
            fill={theme.face}
            stroke={theme.hand}
            stroke-width="2.2"
          />
          <circle cx={CENTER} cy={CENTER} r="2.6" fill={theme.hand} />
        </svg>
      </div>
    </div>
  );
}
