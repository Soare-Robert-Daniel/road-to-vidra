/*
	Application description:

	PURPOSE
	Display the route hours for bus number 420 and 438 in a friendly and eficient matter for the human eye.

	FUNCTIONALITY
	Display the bus hours for each route based on the selected bus.
	Should detect if the weekend or holyday program is active or not.
	Should allow the user to switch between workday and holyday (non persistent options). The default should be based on the type of the day.

	TECH STACK
	Preact, Tailwind

*/

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
const showNextDayProgram = signal(false);
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
  const showNextDay = showNextDayProgram.value;
  const showPast = showPastHours.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

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
          showNextDayProgram={showNextDayProgram}
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
            showNextDay={showNextDay}
            showPastHours={showPast}
          />
          <StationHours
            busNumber={busNumber}
            direction="retur"
            useWeekendSchedule={useWeekendSchedule}
            showNextDay={showNextDay}
            showPastHours={showPast}
          />
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
