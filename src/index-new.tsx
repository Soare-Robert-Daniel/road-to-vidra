import { render } from "preact";
import { signal } from "@preact/signals";

import "./style.css";
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
  type ColorScheme,
} from "./shared/utils/storage";
import { ClassicApp, ModernApp, ExperimentalApp } from "./modes";

// State management with localStorage persistence
const selectedBusNumber = signal(getSelectedBus());
// 'auto': determined by day, 'lucru': forced workday, 'weekend': forced weekend
const programMode = signal<"auto" | "lucru" | "weekend">("auto");
const showPastHours = signal(getShowPastHours());
const clockDisplayMode = signal<ClockDisplayMode>(getClockDisplayMode());
const designVersion = signal<"classic" | "modern" | "experimental">(getDesignVersion());
const colorScheme = signal<ColorScheme>(getColorScheme());

// Persist changes to localStorage
selectedBusNumber.subscribe((value) => setSelectedBus(value));
showPastHours.subscribe((value) => setShowPastHours(value));
clockDisplayMode.subscribe((value) => setClockDisplayMode(value));
designVersion.subscribe((value) => setDesignVersion(value));
colorScheme.subscribe((value) => setColorScheme(value));

export function App() {
  // Branch between classic, modern, and experimental designs
  if (designVersion.value === "classic") {
    return (
      <ClassicApp
        selectedBusNumber={selectedBusNumber}
        programMode={programMode}
        designVersion={designVersion}
        colorScheme={colorScheme}
      />
    );
  }

  if (designVersion.value === "experimental") {
    return (
      <ExperimentalApp
        selectedBusNumber={selectedBusNumber}
        programMode={programMode}
        designVersion={designVersion}
        colorScheme={colorScheme}
      />
    );
  }

  // Modern design (default - table view)
  return (
    <ModernApp
      selectedBusNumber={selectedBusNumber}
      programMode={programMode}
      designVersion={designVersion}
      colorScheme={colorScheme}
    />
  );
}

render(<App />, document.getElementById("app"));
