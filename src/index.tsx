import { render } from "preact";
import { signal } from "@preact/signals";

import "./style.css";
import { isWeekendProgram, getHolidayName } from "./utils";
import {
  getSelectedBus,
  setSelectedBus,
  getShowPastHours,
  setShowPastHours,
  getClockDisplayMode,
  setClockDisplayMode,
  getDesignVersion,
  setDesignVersion,
  getColorScheme,
  setColorScheme,
  type ClockDisplayMode,
  type DesignVersion,
  type ColorScheme,
} from "./storage";
import { HolidayBanner } from "./components/shared-ui/HolidayBanner";
import { Header } from "./components/shared-ui/Header";
import { SettingsMenu } from "./components/settings/SettingsMenu";
import { SolarClock } from "./components/solar-clock";
import { DesignToggleFooter } from "./components/shared-ui/DesignToggleFooter";
import { V2App } from "./v2";

// State management with localStorage persistence
const selectedBusNumber = signal(getSelectedBus());
// 'auto': determined by day, 'lucru': forced workday, 'weekend': forced weekend
const programMode = signal<"auto" | "lucru" | "weekend">("auto");
const showPastHours = signal(getShowPastHours());
const clockDisplayMode = signal<ClockDisplayMode>(getClockDisplayMode());
const designVersion = signal<DesignVersion>(getDesignVersion());
const colorScheme = signal<ColorScheme>(getColorScheme());

// Persist changes to localStorage
selectedBusNumber.subscribe((value) => setSelectedBus(value));
showPastHours.subscribe((value) => setShowPastHours(value));
clockDisplayMode.subscribe((value) => setClockDisplayMode(value));
designVersion.subscribe((value) => setDesignVersion(value));
colorScheme.subscribe((value) => setColorScheme(value));

export function App() {
  // Branch between v1 and v2 designs
  if (designVersion.value === "v2") {
    return (
      <V2App
        selectedBusNumber={selectedBusNumber}
        designVersion={designVersion}
        colorScheme={colorScheme}
      />
    );
  }

  // v1 design (original)
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);
  const holidayName = getHolidayName(currentDate);

  // By reading the signals here, we ensure this component re-renders on change.
  const busNumber = selectedBusNumber.value;
  const mode = programMode.value;
  const scheme = colorScheme.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

  const bgColor = {
    emerald: "bg-slate-50",
    eliza: "bg-rose-50",
    azure: "bg-sky-50",
    amber: "bg-amber-50",
    violet: "bg-violet-50",
    ocean: "bg-teal-50",
    citrus: "bg-lime-50",
    sunset: "bg-orange-50",
    mint: "bg-green-50",
    white: "bg-white",
    "slate-dark": "bg-slate-900 text-slate-100",
    midnight: "bg-indigo-950 text-indigo-100",
    forest: "bg-green-950 text-green-100",
    rust: "bg-red-950 text-red-100",
    "ocean-deep": "bg-teal-950 text-teal-100",
    grape: "bg-purple-950 text-purple-100",
    charcoal: "bg-zinc-900 text-zinc-100",
  }[scheme];

  const isDark = scheme.endsWith("-dark") || ["midnight", "forest", "rust", "ocean-deep", "grape", "charcoal"].includes(scheme);

  return (
    <div
      class={`min-h-screen ${bgColor} text-gray-900 pt-2 px-0.5 pb-0.5 sm:pt-3 sm:px-1 sm:pb-1`}
      style={`color-scheme: ${isDark ? "dark" : "light"}`}
    >
      <div class="max-w-6xl mx-auto">
        {/* Holiday Banner */}
        <HolidayBanner holidayName={holidayName} />

        {/* Ultra-Compact Mobile Header */}
        <Header holidayName={holidayName} currentDate={currentDate} />

        {/* Settings Menu */}
        <SettingsMenu
          selectedBusNumber={selectedBusNumber}
          programMode={programMode}
          isWeekendProgram={isCurrentlyWeekendProgram}
          colorScheme={colorScheme}
        />

        {/* Solar Clock Display */}
        <SolarClock
          busNumber={busNumber}
          useWeekendSchedule={useWeekendSchedule}
          clockDisplayMode={clockDisplayMode}
          colorScheme={colorScheme}
        />

        {/* Footer toggle to v2 */}
        <DesignToggleFooter designVersion={designVersion} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
