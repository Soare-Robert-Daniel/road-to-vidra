// Local Storage utilities for persistent settings

const STORAGE_KEYS = {
  SHOW_PAST_HOURS: "vidra-show-past-hours",
  SELECTED_BUS: "vidra-selected-bus",
  COLLAPSED_SECTIONS: "vidra-collapsed-sections",
} as const;

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
