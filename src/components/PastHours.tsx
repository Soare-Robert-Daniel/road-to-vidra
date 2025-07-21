import { JSX } from "preact";
import { HourDisplay } from "./HourDisplay";

interface PastHoursProps {
  hour: string;
  currentTime: number;
  isToday: boolean;
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  className?: string;
}

export function PastHours({
  hour,
  currentTime,
  isToday,
  busNumber,
  direction,
  useWeekendSchedule,
  className,
}: PastHoursProps): JSX.Element {
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
