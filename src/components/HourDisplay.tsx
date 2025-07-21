import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import {
  timeToMinutes,
  formatTimeDifference,
  timeUntilTomorrow,
} from "../utils";
import { useCurrentTime } from "../hooks/useCurrentTime";

interface HourDisplayProps {
  hour: string;
  isNext: boolean;
  currentTime: number;
  isToday?: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function HourDisplay({
  hour,
  isNext,
  currentTime,
  isToday = true,
  busNumber,
  direction,
  className,
}: HourDisplayProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();
  const realTimeNow = new Date(currentTimeSignal.value);
  const realCurrentTime = realTimeNow.getHours() * 60 + realTimeNow.getMinutes();

  const busTime = timeToMinutes(hour);
  let timeDiff;

  if (isToday) {
    timeDiff = busTime - realCurrentTime;
  } else {
    timeDiff = timeUntilTomorrow(hour);
  }

  let remainingTime = "";
  // Show remaining time for ALL future buses, not just the next one
  if (timeDiff > 0) {
    remainingTime = formatTimeDifference(timeDiff);
  }

  const isPassed = isToday && busTime < realCurrentTime;
  const isTomorrow = !isToday;

  // Define theme colors based on bus number and direction
  const getThemeClasses = () => {
    if (busNumber === "420") {
      if (direction === "tur") {
        return {
          bg: "bg-blue-50",
          text: "text-blue-800",
          nextBg: "bg-blue-100",
          nextBorder: "border-blue-500",
          nextText: "text-blue-800",
          remainingText: "text-blue-600",
          nextRemainingText: "text-blue-600",
        };
      } else {
        return {
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
        return {
          bg: "bg-red-50",
          text: "text-red-800",
          nextBg: "bg-red-100",
          nextBorder: "border-red-500",
          nextText: "text-red-800",
          remainingText: "text-red-600",
          nextRemainingText: "text-red-600",
        };
      } else {
        return {
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
  };

  const themeClasses = getThemeClasses();

  // Base container classes
  const baseClasses =
    "px-0.5 py-0 rounded-lg text-center transition-all min-h-[3rem] flex flex-col justify-center cursor-pointer select-none";

  // Conditional classes based on state
  const getContainerClasses = () => {
    if (isNext) {
      return twMerge(
        baseClasses,
        themeClasses.nextBg,
        "border-1",
        themeClasses.nextBorder,
        themeClasses.nextText,
        "font-semibold shadow-md"
      );
    } else if (isPassed) {
      return twMerge(
        baseClasses,
        "bg-gray-100 text-gray-500 cursor-not-allowed opacity-75"
      );
    } else if (isTomorrow) {
      return twMerge(
        baseClasses,
        "bg-indigo-50 text-indigo-700 border-1 border-indigo-200"
      );
    } else {
      return twMerge(
        baseClasses,
        themeClasses.bg,
        themeClasses.text,
        "border border-transparent"
      );
    }
  };

  const getRemainingTimeClasses = () => {
    const baseTimeClasses = "text-base font-medium leading-none";

    if (isNext) {
      return twMerge(baseTimeClasses, themeClasses.nextRemainingText);
    } else if (isTomorrow) {
      return twMerge(baseTimeClasses, "text-indigo-600");
    } else {
      return twMerge(baseTimeClasses, themeClasses.remainingText);
    }
  };

  return (
    <div class={twMerge(getContainerClasses(), className)}>
      <div class={twMerge("tabular-nums leading-tight text-2xl font-medium")}>
        {hour}
      </div>
      {remainingTime && (
        <div class={getRemainingTimeClasses()}>{remainingTime}</div>
      )}
    </div>
  );
}
