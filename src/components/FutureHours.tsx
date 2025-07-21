import { JSX } from "preact";
import { HourDisplay } from "./HourDisplay";

interface FutureHoursProps {
  hour: string;
  currentTime: number;
  isToday: boolean;
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  className?: string;
}

export function FutureHours({
  hour,
  currentTime,
  isToday,
  busNumber,
  direction,
  useWeekendSchedule,
  className,
}: FutureHoursProps): JSX.Element {
  return (
    <HourDisplay
      hour={hour}
      isNext={false}
      currentTime={currentTime}
      isToday={isToday}
      busNumber={busNumber}
      direction={direction}
      useWeekendSchedule={useWeekendSchedule}
      className={className}
    />
  );
}
