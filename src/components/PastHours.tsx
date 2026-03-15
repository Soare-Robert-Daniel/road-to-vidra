import { JSX } from "preact";
import { HourDisplay } from "./HourDisplay";

interface PastHoursProps {
  hour: string;
  isToday: boolean;
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  className?: string;
}

export function PastHours({
  hour,
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
      isToday={isToday}
      busNumber={busNumber}
      direction={direction}
      useWeekendSchedule={useWeekendSchedule}
      className={className}
    />
  );
}
