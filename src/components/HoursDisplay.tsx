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

  let finalHours;
  let nextBusIndex = -1;

  if (showNextDay) {
    // Show tomorrow's complete program
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const isTomorrowWeekend = isWeekendProgram(tomorrowDate);

    // Get tomorrow's hours
    const busData = busScheduleData.bus[busNumber]?.[direction];
    const tomorrowHours = busData
      ? isTomorrowWeekend
        ? busData.weekendHours
        : busData.workingHours
      : [];

    // All hours are tomorrow's hours, so the first one is the next bus
    finalHours = tomorrowHours.map((h) => ({ hour: h, isToday: false }));
    nextBusIndex = finalHours.length > 0 ? 0 : -1;
  } else {
    // Show today's program
    const nextBusIndexForToday = hours.findIndex((timeStr) => {
      const busTime = timeToMinutes(timeStr);
      return busTime > currentTime;
    });

    finalHours = hours.map((h) => ({ hour: h, isToday: true }));
    nextBusIndex = nextBusIndexForToday;
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

          // Skip past hours if showPastHours is false and we're showing today
          if (isPast && !showPastHours && busInfo.isToday) {
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
