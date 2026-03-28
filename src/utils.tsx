import { nonFixedHolidays, romanianNationalHolidays } from "./config";

const ROMANIA_TIMEZONE = "Europe/Bucharest";

/**
 * Get Romania date components (month-day) in Romania timezone
 */
const getRomaniaDateStr = (date: Date): string => {
  const month = date.toLocaleString("en-CA", { month: "2-digit", timeZone: ROMANIA_TIMEZONE });
  const day = date.toLocaleString("en-CA", { day: "2-digit", timeZone: ROMANIA_TIMEZONE });
  return `${month}-${day}`;
};

/**
 * Get Romania day of week (0=Sunday, 6=Saturday) in Romania timezone
 */
const getRomaniaDayOfWeek = (date: Date): number => {
  const weekday = date.toLocaleString("en-CA", { weekday: "short", timeZone: ROMANIA_TIMEZONE });
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
};

/**
 * Check if the given date is a holiday (in Romania timezone).
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a holiday, false otherwise.
 */
export const isHoliday = (date: Date): boolean => {
  const dateStr = getRomaniaDateStr(date);
  return (
    romanianNationalHolidays.some((h) => h.date === dateStr) ||
    nonFixedHolidays.some((h) => h.date === dateStr)
  );
};

/**
 * Get the holiday name for a given date if it exists.
 * @param {Date} date The date to check
 * @returns {string|null} The holiday name or null if not a holiday
 */
export const getHolidayName = (date: Date): string | null => {
  const dateStr = getRomaniaDateStr(date);
  const holiday =
    romanianNationalHolidays.find((h) => h.date === dateStr) ||
    nonFixedHolidays.find((h) => h.date === dateStr);
  return holiday ? holiday.name : null;
};

/**
 * Check if the given date is a weekend (in Romania timezone).
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a weekend, false otherwise.
 */
export const isWeekend = (date: Date): boolean => {
  const day = getRomaniaDayOfWeek(date);
  return day === 0 || day === 6;
};

/**
 * Check if the given date has a weekend program. Holidays have the same program as the weekend.
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a holiday or a weekend, false otherwise.
 */
export const isWeekendProgram = (date: Date): boolean => {
  return isWeekend(date) || isHoliday(date);
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {string} timeStr Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr: string) => {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
};

/**
 * Format minutes into hours and minutes display (mobile-optimized)
 * @param {number} minutes Number of minutes
 * @returns {string} Formatted time difference
 */
export const formatTimeDifference = (minutes: number): string => {
  if (minutes <= 0) return "";

  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${days}z ${hours > 0 ? `${hours}h` : ""}`.trim();
  }

  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins : ""}`;
  }

  return `${mins}'`;
};
