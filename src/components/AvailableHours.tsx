import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { HourDisplay } from "./HourDisplay";

interface AvailableHoursProps {
  hour: string;
  currentTime: number;
  isToday: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function AvailableHours({
  hour,
  currentTime,
  isToday,
  busNumber,
  direction,
  className,
}: AvailableHoursProps): JSX.Element {
  return (
    <HourDisplay
      hour={hour}
      isNext={true}
      currentTime={currentTime}
      isToday={isToday}
      busNumber={busNumber}
      direction={direction}
      className={className}
    />
  );
}
