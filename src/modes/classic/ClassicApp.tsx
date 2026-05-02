import { JSX } from "preact";
import { Signal } from "@preact/signals";

import { type ColorScheme } from "../../shared/utils/storage";
import { isWeekendProgram } from "../../shared/utils/utils";
import { ModeSelector } from "../../shared/components/ui";
import { getAppBgClass, isDarkScheme } from "../../shared/components/color-scheme";

import { BusButtons, ClassicProgramButtons, HoursColumns, MapSection } from "./components";

interface ClassicAppProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  designVersion: Signal<"classic" | "modern" | "experimental">;
  colorScheme: Signal<ColorScheme>;
}

export function ClassicApp({
  selectedBusNumber,
  programMode,
  designVersion,
  colorScheme,
}: ClassicAppProps): JSX.Element {
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);

  const mode = programMode.value;
  let useWeekendSchedule: boolean;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }
  const scheme = colorScheme.value;

  const bgColor = getAppBgClass(scheme);
  const isDark = isDarkScheme(scheme);

  return (
    <div
      class={`min-h-screen ${bgColor} font-v2 p-2`}
      style={`color-scheme: ${isDark ? "dark" : "light"}`}
    >
      <div class="max-w-4xl mx-auto">
        {/* Top row: Bus (1/4) | Program (3/4) */}
        <div class="grid grid-cols-10 gap-0 p-0">
          <div class="col-span-3">
            <BusButtons
              selectedBusNumber={selectedBusNumber}
              colorScheme={colorScheme}
            />
          </div>
          <div class="col-span-7">
            <ClassicProgramButtons
              programMode={programMode}
              isWeekendProgram={isCurrentlyWeekendProgram}
              colorScheme={colorScheme}
            />
          </div>
        </div>

        {/* Hours columns */}
        <HoursColumns
          busNumber={selectedBusNumber.value}
          useWeekendSchedule={useWeekendSchedule}
        />

        {/* Map with embedded BusDataTable */}
        <MapSection busNumber={selectedBusNumber.value as "420" | "438"} />

        {/* Mode selector */}
        <ModeSelector designVersion={designVersion} colorScheme={colorScheme} />
      </div>
    </div>
  );
}
