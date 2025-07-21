import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { timeToMinutes } from "../utils";
import { PastHours } from "./PastHours";
import { AvailableHours } from "./AvailableHours";
import { FutureHours } from "./FutureHours";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useState, useEffect } from "preact/hooks";
import { getIsSectionCollapsed, setIsSectionCollapsed } from "../storage";

interface HoursDisplayProps {
  hours: string[];
  useWeekendSchedule: boolean;
  showPastHours: boolean;
  busNumber: string;
  direction: string;
  isTodaySchedule: boolean;
  className?: string;
}

export function HoursDisplay({
  hours,
  useWeekendSchedule,
  busNumber,
  direction,
  isTodaySchedule,
  className,
}: HoursDisplayProps): JSX.Element {
  const currentTimeSignal = useCurrentTime();
  const initialCollapsedState =
    getIsSectionCollapsed(busNumber, direction) ?? isTodaySchedule;
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsedState);

  useEffect(() => {
    const storedState = getIsSectionCollapsed(busNumber, direction);
    if (storedState === undefined) {
      setIsCollapsed(isTodaySchedule);
    }
  }, [isTodaySchedule, busNumber, direction]);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setIsSectionCollapsed(busNumber, direction, newState);
  };

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

  const finalHours = hours.map((h) => ({
    hour: h,
    isToday: isTodaySchedule,
  }));

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

  const futureHours = finalHours.filter((busInfo) => {
    const busTime = timeToMinutes(busInfo.hour);
    const isPast = busInfo.isToday && busTime < currentTime;
    return !isPast;
  });

  const showNoMoreBusesMessage =
    futureHours.length === 0 && pastHours.length > 0;

  return (
    <div
      class={twMerge("flex flex-col", className)}
      role="button"
      onClick={handleToggleCollapse}
    >
      <div class={twMerge("grid grid-cols-5 gap-1 text-center")}>
        {pastHours.length > 0 && (
          <CollapsableHours isCollapsed={isCollapsed}>
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
          </CollapsableHours>
        )}

        {showNoMoreBusesMessage && !isCollapsed && (
          <div class="col-span-4 text-gray-500 text-center py-1 text-xs">
            Nu mai sunt curse pentru astăzi.
          </div>
        )}

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
    </div>
  );
}

function CollapsableHours({ children, isCollapsed }) {
  return (
    <>
      {isCollapsed && (
        <div class=" px-0.5 py-0 flex flex-row justify-center items-center cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-6 stroke-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
            />
          </svg>
        </div>
      )}
      {!isCollapsed && <>{children}</>}
    </>
  );
}
