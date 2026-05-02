import { JSX } from "preact";
import { Signal, signal } from "@preact/signals";

import { type ColorScheme, type ClockDisplayMode } from "../../shared/utils/storage";
import { isWeekendProgram, getHolidayName } from "../../shared/utils/utils";
import { HolidayBanner, Header, ModeSelector } from "../../shared/components/ui";
import { SettingsMenu } from "../../shared/components/settings";
import { SolarClock } from "../../shared/components/solar-clock";
import { getAppBgClass, isDarkScheme } from "../../shared/components/color-scheme";

// Local clock display mode for experimental (excludes "tabel")
const experimentalDisplayMode = signal<ClockDisplayMode>("round");

interface ExperimentalAppProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  designVersion: Signal<"classic" | "modern" | "experimental">;
  colorScheme: Signal<ColorScheme>;
}

export function ExperimentalApp({
  selectedBusNumber,
  programMode,
  designVersion,
  colorScheme,
}: ExperimentalAppProps): JSX.Element {
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);
  const holidayName = getHolidayName(currentDate);

  const busNumber = selectedBusNumber.value;
  const mode = programMode.value;
  const scheme = colorScheme.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

  const bgColor = getAppBgClass(scheme);
  const isDark = isDarkScheme(scheme);

  return (
    <div
      class={`min-h-screen ${bgColor} text-gray-900 pt-4 px-0.5 pb-0.5 sm:pt-6 sm:px-1 sm:pb-1`}
      style={`color-scheme: ${isDark ? "dark" : "light"}`}
    >
      <div class="max-w-6xl mx-auto">
        <HolidayBanner holidayName={holidayName} />
        <Header holidayName={holidayName} currentDate={currentDate} />
        <SettingsMenu
          selectedBusNumber={selectedBusNumber}
          programMode={programMode}
          isWeekendProgram={isCurrentlyWeekendProgram}
          colorScheme={colorScheme}
        />
        <SolarClock
          busNumber={busNumber}
          useWeekendSchedule={useWeekendSchedule}
          clockDisplayMode={experimentalDisplayMode}
          colorScheme={colorScheme}
          availableModes={["round", "poster", "timeline"]}
        />
        <ModeSelector designVersion={designVersion} />
      </div>
    </div>
  );
}
