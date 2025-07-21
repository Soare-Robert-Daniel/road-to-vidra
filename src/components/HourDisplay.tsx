import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import {
  timeToMinutes,
  formatTimeDifference,
  timeUntilNextOccurrence,
} from "../utils";
import { useCurrentTime } from "../hooks/useCurrentTime";

interface HourDisplayProps {
  hour: string;
  isNext: boolean;
  currentTime: number;
  isToday?: boolean;
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean; // Pass schedule type
  className?: string;
}

export function HourDisplay({
  hour,
  isNext,
  currentTime,
  isToday = true,
  busNumber,
  direction,
  useWeekendSchedule,
  className,
}: HourDisplayProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();
  const realTimeNow = new Date(currentTimeSignal.value);
  const realCurrentTime =
    realTimeNow.getHours() * 60 + realTimeNow.getMinutes();

  const busTime = timeToMinutes(hour);
  const isPassed = isToday && busTime < realCurrentTime;

  let timeDiff = -1;
  let remainingTime = "";

  if (isPassed) {
    // For passed buses, calculate time until the next occurrence
    const nextOccurrence = timeUntilNextOccurrence(hour, useWeekendSchedule);
    if (nextOccurrence.minutes >= 0) {
      timeDiff = nextOccurrence.minutes;
      remainingTime = formatTimeDifference(timeDiff);
    }
  } else if (isToday) {
    // For future buses today
    timeDiff = busTime - realCurrentTime;
    if (timeDiff >= 0) {
      remainingTime = formatTimeDifference(timeDiff);
    }
  } else {
    // For all buses tomorrow (or future days)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const minutesUntilTomorrow = Math.floor(
      (tomorrow.getTime() - realTimeNow.getTime()) / (1000 * 60)
    );
    timeDiff = minutesUntilTomorrow + busTime;
    remainingTime = formatTimeDifference(timeDiff);
  }

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
          passedText: "text-gray-400",
          passedRemainingText: "text-gray-500",
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
          passedText: "text-gray-400",
          passedRemainingText: "text-gray-500",
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
          passedText: "text-gray-400",
          passedRemainingText: "text-gray-500",
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
          passedText: "text-gray-400",
          passedRemainingText: "text-gray-500",
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
    if (isPassed) {
      return twMerge(
        baseClasses,
        "bg-gray-100 text-gray-500 select-none opacity-75"
      );
    } else if (isTomorrow) {
      // Use regular theme colors for tomorrow's hours, not indigo
      return twMerge(
        baseClasses,
        themeClasses.bg,
        themeClasses.text,
        "border border-transparent"
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

    if (isNext && isToday) {
      // Only apply "next" styling for today's hours
      return twMerge(baseTimeClasses, themeClasses.nextRemainingText);
    } else if (isPassed) {
      return twMerge(baseTimeClasses, themeClasses.passedRemainingText);
    } else if (isTomorrow) {
      return twMerge(baseTimeClasses, "text-indigo-600");
    } else {
      return twMerge(baseTimeClasses, themeClasses.remainingText);
    }
  };

  const hourClasses = twMerge(
    "tabular-nums leading-tight text-2xl font-medium",
    isPassed && themeClasses.passedText
  );

  return (
    <div class={twMerge(getContainerClasses(), className)}>
      <div class={hourClasses}>{hour}</div>
      <div class={getRemainingTimeClasses()}>{remainingTime}</div>
    </div>
  );
}
