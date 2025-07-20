import { JSX } from "preact";
import { busScheduleData } from "../config";
import { StationName } from "./StationName";
import { HoursDisplay } from "./HoursDisplay";

interface StationHoursProps {
  busNumber: string;
  direction: string;
  useWeekendSchedule: boolean;
  showNextDay: boolean;
}

export function StationHours({
  busNumber,
  direction,
  useWeekendSchedule,
  showNextDay,
}: StationHoursProps): JSX.Element {
  const busData = busScheduleData.bus[busNumber]?.[direction];

  if (!busData) {
    return (
      <div class="bg-white rounded-lg shadow-sm p-2">
        <h3 class="text-base font-semibold text-gray-800 mb-1">
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

  const accentClass =
    busNumber === "420"
      ? direction === "tur"
        ? "bg-blue-50 border-l-4 border-blue-400"
        : "bg-green-50 border-l-4 border-green-400"
      : direction === "tur"
      ? "bg-red-50 border-l-4 border-red-400"
      : "bg-purple-50 border-l-4 border-purple-400";

  return (
    <div class={`bg-white rounded-lg shadow-sm p-2 ${accentClass}`}>
      <StationName
        label={`${stationName} (${direction.toUpperCase()})`}
        busNumber={busNumber}
      />
      <div class="mt-1">
        <HoursDisplay
          hours={hours}
          showNextDay={showNextDay}
          useWeekendSchedule={useWeekendSchedule}
          busNumber={busNumber}
          direction={direction}
        />
      </div>
    </div>
  );
}
