import { JSX } from "preact";
import { twMerge } from "tailwind-merge";
import { busScheduleData } from "../config";
import { type ViewMode } from "../storage";
import { StationName } from "./StationName";
import { HoursDisplay } from "./HoursDisplay";
import { SolarClock } from "./SolarClock";

interface StationHoursProps {
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  showPastHours: boolean;
  isTodaySchedule: boolean;
  viewMode: ViewMode;
  className?: string;
}

export function StationHours({
  busNumber,
  direction,
  useWeekendSchedule,
  showPastHours,
  isTodaySchedule,
  viewMode,
  className,
}: StationHoursProps): JSX.Element {
  const busData = busScheduleData.bus[busNumber]?.[direction];

  if (!busData) {
    return (
      <div class={twMerge("bg-white rounded-lg shadow-sm p-2", className)}>
        <h3 class={twMerge("text-base font-semibold text-gray-800 mb-1")}>
          Nu există date pentru autobuzul {busNumber}
        </h3>
      </div>
    );
  }

  const hours = useWeekendSchedule
    ? busData.weekendHours
    : busData.workingHours;
  const stationName =
    busData.station || (direction === "tur" ? "Vidra" : "Eroi Revoluției");

  // Define accent classes based on bus number and direction
  const getAccentClass = () => {
    if (busNumber === "420") {
      return direction === "tur"
        ? "bg-blue-50 border-l-4 border-blue-400"
        : "bg-green-50 border-l-4 border-green-400";
    } else {
      return direction === "tur"
        ? "bg-red-50 border-l-4 border-red-400"
        : "bg-purple-50 border-l-4 border-purple-400";
    }
  };

  return (
    <div
      class={twMerge(
        "bg-white rounded-lg shadow-sm p-2",
        getAccentClass(),
        className,
      )}
    >
      <StationName
        label={`${stationName} (${direction.toUpperCase()})`}
        busNumber={busNumber}
      />
      <div class={twMerge(viewMode === "clock" ? "mt-0.5" : "mt-1")}>
        {viewMode === "clock" ? (
          <SolarClock
            hours={hours}
            useWeekendSchedule={useWeekendSchedule}
            busNumber={busNumber}
            direction={direction}
          />
        ) : (
          <HoursDisplay
            hours={hours}
            useWeekendSchedule={useWeekendSchedule}
            showPastHours={showPastHours}
            busNumber={busNumber}
            direction={direction}
            isTodaySchedule={isTodaySchedule}
          />
        )}
      </div>
    </div>
  );
}
