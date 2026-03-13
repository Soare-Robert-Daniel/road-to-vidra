import * as SunCalc from "suncalc";

import { formatTimeDifference, isWeekendProgram, timeToMinutes } from "./utils";

const MINUTES_PER_DAY = 24 * 60;

export interface SolarLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SolarTimesSummary {
  sunrise: Date;
  sunset: Date;
  sunriseMinutes: number;
  sunsetMinutes: number;
  currentMinutes: number;
  isDaylight: boolean;
}

export interface NextDeparture {
  time: string;
  minutesUntil: number;
  dayOffset: number;
  targetDate: Date;
}

export const vidraLocation: SolarLocation = {
  name: "Vidra",
  latitude: 44.2667,
  longitude: 26.15,
};

export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesToTimeLabel(totalMinutes: number): string {
  const normalized =
    ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (normalized % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function timeToClockAngle(totalMinutes: number): number {
  return (totalMinutes / MINUTES_PER_DAY) * 360 - 90;
}

export function getSolarTimes(
  date: Date,
  location: SolarLocation = vidraLocation
): SolarTimesSummary {
  const times = SunCalc.getTimes(date, location.latitude, location.longitude);
  const sunriseMinutes = dateToMinutes(times.sunrise);
  const sunsetMinutes = dateToMinutes(times.sunset);
  const currentMinutes = dateToMinutes(date);

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    sunriseMinutes,
    sunsetMinutes,
    currentMinutes,
    isDaylight:
      currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes,
  };
}

export function getNextDeparture(
  hours: string[],
  useWeekendSchedule: boolean,
  now: Date = new Date()
): NextDeparture | null {
  let nextDeparture: NextDeparture | null = null;

  for (const hour of hours) {
    const busMinutes = timeToMinutes(hour);

    for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
      const candidateDate = new Date(now);
      candidateDate.setDate(now.getDate() + dayOffset);

      if (isWeekendProgram(candidateDate) !== useWeekendSchedule) {
        continue;
      }

      candidateDate.setHours(Math.floor(busMinutes / 60), busMinutes % 60, 0, 0);
      const minutesUntil = Math.floor(
        (candidateDate.getTime() - now.getTime()) / (1000 * 60)
      );

      if (minutesUntil < 0) {
        continue;
      }

      const candidate: NextDeparture = {
        time: hour,
        minutesUntil,
        dayOffset,
        targetDate: candidateDate,
      };

      if (
        nextDeparture === null ||
        candidate.minutesUntil < nextDeparture.minutesUntil
      ) {
        nextDeparture = candidate;
      }

      break;
    }
  }

  return nextDeparture;
}

export function formatNextDeparture(nextDeparture: NextDeparture | null): string {
  if (!nextDeparture) {
    return "Nu exista curse disponibile";
  }

  const relativeTime = formatTimeDifference(nextDeparture.minutesUntil);

  if (nextDeparture.dayOffset === 0) {
    return `Astazi, peste ${relativeTime}`;
  }

  if (nextDeparture.dayOffset === 1) {
    return `Maine, peste ${relativeTime}`;
  }

  const weekday = nextDeparture.targetDate.toLocaleDateString("ro-RO", {
    weekday: "long",
  });

  return `${weekday}, peste ${relativeTime}`;
}