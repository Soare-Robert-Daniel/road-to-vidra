import { busScheduleData } from "../config";
import { getNextDeparture, getSolarTimes, type SolarTimesSummary } from "../solar";
import { isWeekendProgram } from "../utils";

import { useCurrentTime } from "./useCurrentTime";
import {
  getClockTheme,
  getRouteLegendLabel,
  getTimeParts,
  isDepartureInDaylight,
  ROUTE_GEOMETRY,
} from "../components/solar-clock/constants";
import type { RouteLayer } from "../components/solar-clock/constants";

interface UseRouteLayersResult {
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
  isSelectedScheduleToday: boolean;
  now: Date;
}

export function useRouteLayers(
  busNumber: string,
  useWeekendSchedule: boolean,
): UseRouteLayersResult | null {
  const busData = busScheduleData.bus[busNumber];

  const currentTimeSignal = useCurrentTime();
  const now = new Date(currentTimeSignal.value);
  const solarTimes = getSolarTimes(now);
  const isSelectedScheduleToday = isWeekendProgram(now) === useWeekendSchedule;

  if (!busData?.tur || !busData?.retur) {
    return null;
  }

  const routeLayers: RouteLayer[] = (["tur", "retur"] as const).map(
    (direction) => {
      const route = busData[direction];
      const hours = useWeekendSchedule
        ? route.weekendHours
        : route.workingHours;
      const entries = hours.map((hour, index) => {
        const timeParts = getTimeParts(hour);

        return {
          index,
          time: hour,
          ...timeParts,
          isDaylight: isDepartureInDaylight(timeParts.totalMinutes, solarTimes),
          isPast:
            isSelectedScheduleToday &&
            timeParts.totalMinutes < solarTimes.currentMinutes,
        };
      });

      return {
        direction,
        label: getRouteLegendLabel(direction, route.station),
        entries,
        nextDeparture: getNextDeparture(hours, useWeekendSchedule, now),
        theme: getClockTheme(busNumber, direction),
        geometry: ROUTE_GEOMETRY[direction],
      };
    },
  );

  return { routeLayers, solarTimes, isSelectedScheduleToday, now };
}
