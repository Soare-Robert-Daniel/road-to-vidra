import { JSX } from "preact";
import { HourDisplay } from "./HourDisplay";

interface AvailableHoursProps {
  hour: string;
  isToday: boolean;
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  className?: string;
}

export function AvailableHours({
  hour,
  isToday,
  busNumber,
  direction,
  useWeekendSchedule,
  className,
}: AvailableHoursProps): JSX.Element {
  return (
    <HourDisplay
      hour={hour}
      isNext={true}
      isToday={isToday}
      busNumber={busNumber}
      direction={direction}
      useWeekendSchedule={useWeekendSchedule}
      className={className}
    />
  );
}
