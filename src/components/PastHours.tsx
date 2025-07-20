import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { HourDisplay } from "./HourDisplay";

interface PastHoursProps {
  hour: string;
  currentTime: number;
  isToday: boolean;
  busNumber: string;
  direction: string;
  className?: string;
}

export function PastHours({
  hour,
  currentTime,
  isToday,
  busNumber,
  direction,
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
      className={className}
    />
  );
}
