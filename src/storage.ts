// Local Storage utilities for persistent settings

const STORAGE_KEYS = {
  SHOW_PAST_HOURS: "vidra-show-past-hours",
  SELECTED_BUS: "vidra-selected-bus",
  COLLAPSED_SECTIONS: "vidra-collapsed-sections",
  VIEW_MODE: "vidra-view-mode",
  CLOCK_DISPLAY_MODE: "vidra-clock-display-mode",
} as const;

export type ViewMode = "table" | "clock";
export type ClockDisplayMode = "round" | "poster";

/**
 * Get a value from localStorage with a fallback default
 */
function getStorageValue<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage
 */
function setStorageValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage for key "${key}":`, error);
  }
}

/**
 * Get the map of collapsed sections from localStorage
 */
const getCollapsedSections = (): Record<string, boolean> => {
  return getStorageValue(STORAGE_KEYS.COLLAPSED_SECTIONS, {});
};

/**
 * Set the map of collapsed sections in localStorage
 */
const setCollapsedSections = (sections: Record<string, boolean>): void => {
  setStorageValue(STORAGE_KEYS.COLLAPSED_SECTIONS, sections);
};

/**
 * Get the collapsed state for a specific bus and direction
 */
export const getIsSectionCollapsed = (
  busNumber: string,
  direction: string
): boolean | undefined => {
  const sections = getCollapsedSections();
  const key = `${busNumber}-${direction}`;
  return sections[key];
};

/**
 * Set the collapsed state for a specific bus and direction
 */
export const setIsSectionCollapsed = (
  busNumber: string,
  direction: string,
  isCollapsed: boolean
): void => {
  const sections = getCollapsedSections();
  const key = `${busNumber}-${direction}`;
  sections[key] = isCollapsed;
  setCollapsedSections(sections);
};

/**
 * Get show past hours setting from localStorage
 */
export const getShowPastHours = (): boolean => {
  return getStorageValue(STORAGE_KEYS.SHOW_PAST_HOURS, true);
};

/**
 * Set show past hours setting in localStorage
 */
export const setShowPastHours = (value: boolean): void => {
  setStorageValue(STORAGE_KEYS.SHOW_PAST_HOURS, value);
};

/**
 * Get selected bus number from localStorage
 */
export const getSelectedBus = (): string => {
  return getStorageValue(STORAGE_KEYS.SELECTED_BUS, "420");
};

/**
 * Set selected bus number in localStorage
 */
export const setSelectedBus = (busNumber: string): void => {
  setStorageValue(STORAGE_KEYS.SELECTED_BUS, busNumber);
};

/**
 * Get the preferred hours view mode from localStorage.
 */
export const getViewMode = (): ViewMode => {
  return getStorageValue<ViewMode>(STORAGE_KEYS.VIEW_MODE, "table");
};

/**
 * Set the preferred hours view mode in localStorage.
 */
export const setViewMode = (value: ViewMode): void => {
  setStorageValue(STORAGE_KEYS.VIEW_MODE, value);
};

export const getClockDisplayMode = (): ClockDisplayMode => {
  return getStorageValue<ClockDisplayMode>(STORAGE_KEYS.CLOCK_DISPLAY_MODE, "poster");
};

export const setClockDisplayMode = (value: ClockDisplayMode): void => {
  setStorageValue(STORAGE_KEYS.CLOCK_DISPLAY_MODE, value);
};
