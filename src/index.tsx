import { render } from "preact";
import { signal } from "@preact/signals";

import "./style.css";
import { isWeekendProgram, getHolidayName } from "./utils";
import {
  getSelectedBus,
  setSelectedBus,
  getShowPastHours,
  setShowPastHours,
} from "./storage";
import {
  HolidayBanner,
  Header,
  SettingsMenu,
  StationHours,
} from "./components";

// State management with localStorage persistence
const selectedBusNumber = signal(getSelectedBus());
// 'auto': determined by day, 'lucru': forced workday, 'weekend': forced weekend
const programMode = signal<"auto" | "lucru" | "weekend">("auto");
const showPastHours = signal(getShowPastHours());

// Persist changes to localStorage
selectedBusNumber.subscribe((value) => setSelectedBus(value));
showPastHours.subscribe((value) => setShowPastHours(value));

export function App() {
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);
  const holidayName = getHolidayName(currentDate);

  // By reading the signals here, we ensure this component re-renders on change.
  const busNumber = selectedBusNumber.value;
  const mode = programMode.value;
  const showPast = showPastHours.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

  const isTodaySchedule = useWeekendSchedule === isCurrentlyWeekendProgram;

  return (
    <div class="min-h-screen bg-gray-50 p-1">
      <div class="max-w-6xl mx-auto">
        {/* Holiday Banner */}
        <HolidayBanner holidayName={holidayName} />

        {/* Ultra-Compact Mobile Header */}
        <Header holidayName={holidayName} currentDate={currentDate} />

        {/* Settings Menu */}
        <SettingsMenu
          selectedBusNumber={selectedBusNumber}
          programMode={programMode}
          showPastHours={showPastHours}
          isWeekendProgram={isCurrentlyWeekendProgram}
          holidayName={holidayName}
        />

        {/* Bus Hours Display */}
        <div class="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
          <StationHours
            busNumber={busNumber}
            direction="tur"
            useWeekendSchedule={useWeekendSchedule}
            showPastHours={showPast}
            isTodaySchedule={isTodaySchedule}
          />
          <StationHours
            busNumber={busNumber}
            direction="retur"
            useWeekendSchedule={useWeekendSchedule}
            showPastHours={showPast}
            isTodaySchedule={isTodaySchedule}
          />
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
