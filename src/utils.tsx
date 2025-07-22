import { nonFixedHolidays, romanianNationalHolidays } from "./config";

/**
 * Check if the given date is a holiday.
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a holiday, false otherwise.
 */
export const isHoliday = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateStr = `${month}-${day}`;

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
export const getHolidayName = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateStr = `${month}-${day}`;

  const holiday =
    romanianNationalHolidays.find((h) => h.date === dateStr) ||
    nonFixedHolidays.find((h) => h.date === dateStr);

  return holiday ? holiday.name : null;
};

/**
 * Check if the given date is a weekend.
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a weekend, false otherwise.
 */
export const isWeekend = (date) => {
  return date.getDay() === 0 || date.getDay() === 6;
};

/**
 * Check if the given date has a weekend program. Holidays have the same program as the weekend.
 *
 * @param {Date} date The date to check.
 * @returns {boolean} True if the date is a holiday or a weekend, false otherwise.
 */
export const isWeekendProgram = (date) => {
  return isWeekend(date) || isHoliday(date);
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {string} timeStr Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
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

/**
 * Calculate time until a specific bus tomorrow
 * @param {string} timeStr Time in format "HH:MM"
 * @returns {number} Minutes until the bus tomorrow
 */
export const timeUntilTomorrow = (timeStr) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const minutesUntilTomorrow = Math.floor(
    (tomorrow.getTime() - now.getTime()) / (1000 * 60)
  );
  const busTime = timeToMinutes(timeStr);

  return minutesUntilTomorrow + busTime;
};

/**
 * Calculate time until the next occurrence of a specific bus hour.
 * Finds the next day with the same schedule type and calculates time until that bus.
 * @param {string} timeStr Time in format "HH:MM"
 * @param {boolean} useWeekendSchedule The type of schedule to look for.
 * @returns {{minutes: number, days: number}}
 */
export const timeUntilNextOccurrence = (
  timeStr: string,
  useWeekendSchedule: boolean
): { minutes: number; days: number } => {
  const now = new Date();

  // Today is the selected schedule type: show time until next bus today, or next occurrence
  const [hour, minute] = timeStr.split(":").map(Number);
  const todayBusTime = new Date();
  todayBusTime.setHours(hour, minute, 0, 0);
  const diffMinutesToday = Math.floor(
    (todayBusTime.getTime() - now.getTime()) / (1000 * 60)
  );
  if (diffMinutesToday > 0) {
    return { minutes: diffMinutesToday, days: 0 };
  }
  // Otherwise, find the next occurrence of this schedule type and return time until first bus
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + i);
    if (isWeekendProgram(futureDate) === useWeekendSchedule) {
      futureDate.setHours(hour, minute, 0, 0);
      const diffMinutes = Math.floor(
        (futureDate.getTime() - now.getTime()) / (1000 * 60)
      );
      return { minutes: diffMinutes, days: i };
    }
  }

  return { minutes: -1, days: -1 };
};
