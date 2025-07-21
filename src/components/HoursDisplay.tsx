import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { timeToMinutes } from "../utils";
import { PastHours } from "./PastHours";
import { AvailableHours } from "./AvailableHours";
import { FutureHours } from "./FutureHours";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useState } from "preact/hooks";

interface HoursDisplayProps {
  hours: string[];
  useWeekendSchedule: boolean;
  showPastHours: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function HoursDisplay({
  hours,
  useWeekendSchedule,
  busNumber,
  direction,
  className,
}: HoursDisplayProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();
  const [showPastHours, setShowPastHours] = useState(false);

  if (!hours || hours.length === 0) {
    return (
      <div class={twMerge("text-gray-500 text-center py-1 text-xs", className)}>
        Nu există ore disponibile
      </div>
    );
  }

  const now = new Date(currentTimeSignal.value);
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Always show today's program
  const nextBusIndexForToday = hours.findIndex((timeStr) => {
    const busTime = timeToMinutes(timeStr);
    return busTime > currentTime;
  });

  const finalHours = hours.map((h) => ({ hour: h, isToday: true }));

  if (finalHours.length === 0) {
    return (
      <div class={twMerge("text-gray-500 text-center py-1 text-xs", className)}>
        Nu există ore disponibile pentru perioada selectată.
      </div>
    );
  }

  const pastHours = finalHours.filter((busInfo) => {
    const busTime = timeToMinutes(busInfo.hour);
    return busInfo.isToday && busTime < currentTime;
  });

  const futureHours = finalHours.filter((busInfo, index) => {
    const busTime = timeToMinutes(busInfo.hour);
    const isPast = busInfo.isToday && busTime < currentTime;
    return !isPast;
  });

  return (
    <div class={twMerge("flex flex-col", className)}>
      <div class={twMerge("grid grid-cols-5 gap-1 text-center")}>
        {futureHours.map((busInfo, index) => {
          const isNext = index === 0 && nextBusIndexForToday !== -1;

          if (isNext) {
            return (
              <AvailableHours
                key={`${busInfo.hour}-${busInfo.isToday}-available`}
                hour={busInfo.hour}
                currentTime={currentTime}
                isToday={busInfo.isToday}
                busNumber={busNumber}
                direction={direction}
                useWeekendSchedule={useWeekendSchedule}
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
                useWeekendSchedule={useWeekendSchedule}
              />
            );
          }
        })}
      </div>
      {pastHours.length > 0 && (
        <CollapsableHours>
          <div class={twMerge("grid grid-cols-5 gap-1 text-center mt-1")}>
            {pastHours.map((busInfo) => (
              <PastHours
                key={`${busInfo.hour}-${busInfo.isToday}-past`}
                hour={busInfo.hour}
                currentTime={currentTime}
                isToday={busInfo.isToday}
                busNumber={busNumber}
                direction={direction}
                useWeekendSchedule={useWeekendSchedule}
              />
            ))}
          </div>
        </CollapsableHours>
      )}
    </div>
  );
}

function CollapsableHours({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div class="text-center mt-2">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        class="text-base text-gray-500 hover:text-gray-600"
      >
        {isCollapsed ? "Vezi cursele trecute" : "Ascunde cursele trecute"}
      </button>
      {!isCollapsed && <div class="mt-2">{children}</div>}
    </div>
  );
}
