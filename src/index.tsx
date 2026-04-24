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
  type ClockDisplayMode,
  type DesignVersion,
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

// Persist changes to localStorage
selectedBusNumber.subscribe((value) => setSelectedBus(value));
showPastHours.subscribe((value) => setShowPastHours(value));
clockDisplayMode.subscribe((value) => setClockDisplayMode(value));
designVersion.subscribe((value) => setDesignVersion(value));

export function App() {
  // Branch between v1 and v2 designs
  if (designVersion.value === "v2") {
    return <V2App selectedBusNumber={selectedBusNumber} designVersion={designVersion} />;
  }

  // v1 design (original)
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);
  const holidayName = getHolidayName(currentDate);

  // By reading the signals here, we ensure this component re-renders on change.
  const busNumber = selectedBusNumber.value;
  const mode = programMode.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

  return (
    <div class="min-h-screen bg-gray-50 p-0.5 sm:p-1">
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
        />

        {/* Solar Clock Display */}
        <SolarClock
          busNumber={busNumber}
          useWeekendSchedule={useWeekendSchedule}
          clockDisplayMode={clockDisplayMode}
        />

        {/* Footer toggle to v2 */}
        <DesignToggleFooter designVersion={designVersion} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
