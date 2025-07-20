import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { HourDisplay } from "./HourDisplay";

interface FutureHoursProps {
  hour: string;
  currentTime: number;
  isToday: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function FutureHours({
  hour,
  currentTime,
  isToday,
  busNumber,
  direction,
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
      className={className}
    />
  );
}
