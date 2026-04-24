import { JSX } from "preact";
import { Signal } from "@preact/signals";

import { type ColorScheme } from "./storage";
import { isWeekendProgram, getHolidayName } from "./utils";
import { HolidayBanner } from "./components/shared-ui/HolidayBanner";
import { Header } from "./components/shared-ui/Header";
import { SettingsMenu } from "./components/settings/SettingsMenu";
import { SolarClock } from "./components/solar-clock";
import { ModeSelector } from "./components/shared-ui/ModeSelector";

interface ModernAppProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  designVersion: Signal<"classic" | "modern" | "experimental">;
  colorScheme: Signal<ColorScheme>;
}

export function ModernApp({
  selectedBusNumber,
  programMode,
  designVersion,
  colorScheme,
}: ModernAppProps): JSX.Element {
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
        {/* Modern mode: table view only, no mode toggle */}
        <SolarClock
          busNumber={busNumber}
          useWeekendSchedule={useWeekendSchedule}
          colorScheme={colorScheme}
        />
        <ModeSelector designVersion={designVersion} />
      </div>
    </div>
  );
}
