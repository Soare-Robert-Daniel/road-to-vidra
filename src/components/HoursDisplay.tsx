import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { busScheduleData } from "../config";
import { isWeekendProgram, timeToMinutes } from "../utils";
import { PastHours } from "./PastHours";
import { AvailableHours } from "./AvailableHours";
import { FutureHours } from "./FutureHours";
import { useCurrentTime } from "../hooks/useCurrentTime";

interface HoursDisplayProps {
  hours: string[];
  showNextDay: boolean;
  useWeekendSchedule: boolean;
  showPastHours: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function HoursDisplay({
  hours,
  showNextDay,
  useWeekendSchedule,
  showPastHours,
  busNumber,
  direction,
  className,
}: HoursDisplayProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();

  if (!hours || hours.length === 0) {
    return (
      <div class={twMerge("text-gray-500 text-center py-1 text-xs", className)}>
        Nu există ore disponibile
      </div>
    );
  }

  const now = new Date(currentTimeSignal.value);
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find next bus for today's full list
  const nextBusIndexForToday = hours.findIndex((timeStr) => {
    const busTime = timeToMinutes(timeStr);
    return busTime > currentTime;
  });

  let finalHours = hours.map((h) => ({ hour: h, isToday: true }));
  let nextBusIndex = nextBusIndexForToday;

  if (showNextDay) {
    // Filter out today's past hours
    const remainingToday =
      nextBusIndexForToday === -1 ? [] : hours.slice(nextBusIndexForToday);

    // Get tomorrow's hours
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const isTomorrowWeekend = isWeekendProgram(tomorrowDate);

    // Use the correct direction for tomorrow's schedule
    const busData = busScheduleData.bus[busNumber]?.[direction];
    const tomorrowHours = busData
      ? isTomorrowWeekend
        ? busData.weekendHours
        : busData.workingHours
      : [];

    // Combine remaining of today with all of tomorrow
    finalHours = [
      ...remainingToday.map((h) => ({ hour: h, isToday: true })),
      ...tomorrowHours.map((h) => ({ hour: h, isToday: false })),
    ];

    // The next bus is always the first in this combined list
    nextBusIndex = finalHours.length > 0 ? 0 : -1;
  }

  if (finalHours.length === 0) {
    return (
      <div class={twMerge("text-gray-500 text-center py-1 text-xs", className)}>
        Nu există ore disponibile pentru perioada selectată.
      </div>
    );
  }

  return (
    <div class={twMerge("flex flex-col", className)}>
      <div class={twMerge("grid grid-cols-5 gap-1 text-center")}>
        {finalHours.map((busInfo, index) => {
          const busTime = timeToMinutes(busInfo.hour);
          const isPast = busInfo.isToday && busTime < currentTime;
          const isNext = index === nextBusIndex;

          // Skip past hours if showPastHours is false
          if (isPast && !showPastHours) {
            return null;
          }

          if (isPast) {
            return (
              <PastHours
                key={`${busInfo.hour}-${busInfo.isToday}-past`}
                hour={busInfo.hour}
                currentTime={currentTime}
                isToday={busInfo.isToday}
                busNumber={busNumber}
                direction={direction}
              />
            );
          } else if (isNext) {
            return (
              <AvailableHours
                key={`${busInfo.hour}-${busInfo.isToday}-available`}
                hour={busInfo.hour}
                currentTime={currentTime}
                isToday={busInfo.isToday}
                busNumber={busNumber}
                direction={direction}
              />
            );
          } else {
            return (
              <FutureHours
                key={`${busInfo.hour}-${busInfo.isToday}-future`}
                hour={busInfo.hour}
                currentTime={currentTime}
                isToday={busInfo.isToday}
                busNumber={busNumber}
                direction={direction}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
