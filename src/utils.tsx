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
export const formatTimeDifference = (minutes) => {
  if (minutes <= 0) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 12) {
    return `${hours}h`;
  } else if (hours > 0) {
    return `${hours}h${mins > 0 ? mins : ""}`;
  } else if (mins > 60) {
    return `${mins}m`;
  } else {
    return `${mins}'`;
  }
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
