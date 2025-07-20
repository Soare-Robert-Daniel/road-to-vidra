import { JSX } from "preact";
import { busScheduleData } from "../config";
import { isWeekendProgram, timeToMinutes } from "../utils";
import { HourDisplay } from "./HourDisplay";

interface HoursDisplayProps {
  hours: string[];
  showNextDay: boolean;
  useWeekendSchedule: boolean;
  busNumber: string;
  direction: string;
}

export function HoursDisplay({
  hours,
  showNextDay,
  useWeekendSchedule,
  busNumber,
  direction,
}: HoursDisplayProps): JSX.Element {
  if (!hours || hours.length === 0) {
    return (
      <div class="text-gray-500 text-center py-1 text-xs">
        Nu există ore disponibile
      </div>
    );
  }

  const now = new Date();
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
      <div class="text-gray-500 text-center py-1 text-xs">
        Nu există ore disponibile pentru perioada selectată.
      </div>
    );
  }

  return (
    <div class="grid grid-cols-5 gap-0.5 mb-2">
      {finalHours.map((busInfo, index) => (
        <HourDisplay
          key={`${busInfo.hour}-${busInfo.isToday}`}
          hour={busInfo.hour}
          isNext={index === nextBusIndex}
          currentTime={currentTime}
          isToday={busInfo.isToday}
          busNumber={busNumber}
          direction={direction}
        />
      ))}
    </div>
  );
}
