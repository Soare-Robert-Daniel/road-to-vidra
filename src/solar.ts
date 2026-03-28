import * as SunCalc from "suncalc";

import { isWeekendProgram, timeToMinutes } from "./utils";

// Total minutes in a 24-hour day, used to normalize times and calculate clock angles
export const MINUTES_PER_DAY = 24 * 60;

export interface SolarLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
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
  timezone: "Europe/Bucharest",
};

// Convert Date to minutes in Romania timezone (EET/EEST)
export function dateToMinutes(date: Date): number {
  const hourStr = date.toLocaleString("en-CA", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Bucharest",
  });
  const minuteStr = date.toLocaleString("en-CA", {
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  });
  return parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
}

export function minutesToTimeLabel(totalMinutes: number): string {
  const normalized =
    ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
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
  location: SolarLocation = vidraLocation,
): SolarTimesSummary {
  const times = SunCalc.getTimes(date, location.latitude, location.longitude);
  const sunriseMinutes = dateToMinutes(times.sunrise);
  const sunsetMinutes = dateToMinutes(times.sunset);
  // Get current time in Romania timezone
  const currentMinutes = dateToMinutes(date);

  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    sunriseMinutes,
    sunsetMinutes,
    currentMinutes,
    isDaylight: currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes,
  };
}

export function findDepartureCandidates(
  hours: string[],
  useWeekendSchedule: boolean,
  now: Date = new Date(),
): NextDeparture[] {
  const candidates: NextDeparture[] = [];
  const currentMinutes = dateToMinutes(now);

  for (const hour of hours) {
    const busMinutes = timeToMinutes(hour);

    for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
      const candidateMinutes = busMinutes + dayOffset * MINUTES_PER_DAY - currentMinutes;

      if (candidateMinutes < 0) {
        continue;
      }

      const candidateDayOffset = Math.floor((currentMinutes + candidateMinutes) / MINUTES_PER_DAY);
      const candidateDate = new Date(now.getTime() + candidateMinutes * 60 * 1000);

      if (isWeekendProgram(candidateDate) !== useWeekendSchedule) {
        continue;
      }

      candidates.push({
        time: hour,
        minutesUntil: candidateMinutes,
        dayOffset: candidateDayOffset,
        targetDate: candidateDate,
      });

      break;
    }
  }

  candidates.sort((a, b) => a.minutesUntil - b.minutesUntil);
  return candidates;
}

export function getNextDeparture(
  hours: string[],
  useWeekendSchedule: boolean,
  now: Date = new Date(),
): NextDeparture | null {
  return findDepartureCandidates(hours, useWeekendSchedule, now)[0] ?? null;
}

export function getUpcomingDepartures(
  hours: string[],
  useWeekendSchedule: boolean,
  now: Date = new Date(),
  limit: number = 3,
): NextDeparture[] {
  return findDepartureCandidates(hours, useWeekendSchedule, now).slice(0, limit);
}
