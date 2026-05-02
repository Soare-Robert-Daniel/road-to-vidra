// Local Storage utilities for persistent settings

const STORAGE_KEYS = {
  SHOW_PAST_HOURS: "vidra-show-past-hours",
  SELECTED_BUS: "vidra-selected-bus",
  CLOCK_DISPLAY_MODE: "vidra-clock-display-mode",
  DESIGN_VERSION: "vidra-design-version",
  COLOR_SCHEME: "vidra-color-scheme",
} as const;

export type ClockDisplayMode = "round" | "poster" | "tabel" | "timeline";
export type DesignVersion = "classic" | "modern" | "experimental";
export type ColorScheme = "emerald" | "eliza" | "azure" | "amber" | "violet" | "ocean" | "citrus" | "sunset" | "mint" | "white" | "slate-dark" | "midnight" | "forest" | "rust" | "ocean-deep" | "grape" | "charcoal";

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

export const getClockDisplayMode = (): ClockDisplayMode => {
  return getStorageValue<ClockDisplayMode>(STORAGE_KEYS.CLOCK_DISPLAY_MODE, "poster");
};

export const setClockDisplayMode = (value: ClockDisplayMode): void => {
  setStorageValue(STORAGE_KEYS.CLOCK_DISPLAY_MODE, value);
};

export const getDesignVersion = (): DesignVersion => {
  const value = getStorageValue<string>(STORAGE_KEYS.DESIGN_VERSION, "modern");
  // Migration: v1 → modern, v2 → classic
  if (value === "v1") return "modern";
  if (value === "v2") return "classic";
  return value as DesignVersion;
};

export const setDesignVersion = (value: DesignVersion): void => {
  setStorageValue(STORAGE_KEYS.DESIGN_VERSION, value);
};

export const getColorScheme = (): ColorScheme => {
  return getStorageValue<ColorScheme>(STORAGE_KEYS.COLOR_SCHEME, "emerald");
};

// Migration: convert old "rose" value to "eliza"
function migrateRoseToEliza(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
    if (stored === '"rose"') {
      localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, '"eliza"');
    }
  } catch {
    // ignore migration errors
  }
}
migrateRoseToEliza();

export const setColorScheme = (value: ColorScheme): void => {
  setStorageValue(STORAGE_KEYS.COLOR_SCHEME, value);
};
