import { JSX } from "preact";
import {
  timeToMinutes,
  formatTimeDifference,
  timeUntilTomorrow,
} from "../utils";

interface HourDisplayProps {
  hour: string;
  isNext: boolean;
  currentTime: number;
  isToday?: boolean;
  busNumber: string;
  direction: string;
}

export function HourDisplay({
  hour,
  isNext,
  currentTime,
  isToday = true,
  busNumber,
  direction,
}: HourDisplayProps): JSX.Element {
  const busTime = timeToMinutes(hour);
  let timeDiff;

  if (isToday) {
    timeDiff = busTime - currentTime;
  } else {
    // Tomorrow's bus - calculate time until tomorrow + bus time
    timeDiff = timeUntilTomorrow(hour);
  }

  let remainingTime = "";
  // Show remaining time for ALL future buses, not just the next one
  if (timeDiff > 0) {
    remainingTime = formatTimeDifference(timeDiff);
  }

  const isPassed = isToday && busTime < currentTime;
  const isTomorrow = !isToday;

  let accentClasses = {
    bg: "bg-gray-50",
    text: "text-gray-800",
    nextBg: "bg-yellow-100",
    nextBorder: "border-yellow-500",
    nextText: "text-yellow-800",
    remainingText: "text-gray-600",
    nextRemainingText: "text-yellow-600",
  };

  if (busNumber === "420") {
    if (direction === "tur") {
      // Blue
      accentClasses = {
        bg: "bg-blue-50",
        text: "text-blue-800",
        nextBg: "bg-blue-100",
        nextBorder: "border-blue-500",
        nextText: "text-blue-800",
        remainingText: "text-blue-600",
        nextRemainingText: "text-blue-600",
      };
    } else {
      // Green
      accentClasses = {
        bg: "bg-green-50",
        text: "text-green-800",
        nextBg: "bg-green-100",
        nextBorder: "border-green-500",
        nextText: "text-green-800",
        remainingText: "text-green-600",
        nextRemainingText: "text-green-600",
      };
    }
  } else {
    // 438
    if (direction === "tur") {
      // Red
      accentClasses = {
        bg: "bg-red-50",
        text: "text-red-800",
        nextBg: "bg-red-100",
        nextBorder: "border-red-500",
        nextText: "text-red-800",
        remainingText: "text-red-600",
        nextRemainingText: "text-red-600",
      };
    } else {
      // Purple
      accentClasses = {
        bg: "bg-purple-50",
        text: "text-purple-800",
        nextBg: "bg-purple-100",
        nextBorder: "border-purple-500",
        nextText: "text-purple-800",
        remainingText: "text-purple-600",
        nextRemainingText: "text-purple-600",
      };
    }
  }

  return (
    <div
      class={`
      px-0.5 py-0 rounded text-center transition-all min-h-[3rem] flex flex-col justify-center
      ${
        isNext
          ? `${accentClasses.nextBg} border ${accentClasses.nextBorder} ${accentClasses.nextText} font-semibold`
          : isPassed
          ? "bg-gray-100 text-gray-500"
          : isTomorrow
          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
          : `${accentClasses.bg} ${accentClasses.text}`
      }
    `}
    >
      <div class="tabular-nums leading-tight text-2xl font-medium">{hour}</div>
      {remainingTime && (
        <div
          class={`text-base font-medium leading-none ${
            isNext
              ? accentClasses.nextRemainingText
              : isTomorrow
              ? "text-indigo-600"
              : accentClasses.remainingText
          }`}
        >
          {remainingTime}
        </div>
      )}
    </div>
  );
}
