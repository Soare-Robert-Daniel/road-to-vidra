import { JSX } from "preact";
import { Signal, signal } from "@preact/signals";

import { type DesignVersion, type ColorScheme } from "../storage";
import { DesignToggleFooter } from "../components/shared-ui/DesignToggleFooter";

import { BusButtons } from "./BusButtons";
import { ProgramButtons } from "./ProgramButtons";
import { HoursColumns } from "./HoursColumns";
import { V2Map } from "./V2Map";
import { ColorSchemeToggle } from "./ColorSchemeToggle";

// Local program mode signal (no "auto" mode for v2)
const programMode = signal<"lucru" | "weekend">("lucru");

interface V2AppProps {
  selectedBusNumber: Signal<string>;
  designVersion: Signal<DesignVersion>;
  colorScheme: Signal<ColorScheme>;
}

export function V2App({
  selectedBusNumber,
  designVersion,
  colorScheme,
}: V2AppProps): JSX.Element {
  const useWeekendSchedule = programMode.value === "weekend";
  const scheme = colorScheme.value;

  const bgColor = {
    white: "bg-white",
    emerald: "bg-slate-50",
    eliza: "bg-rose-50",
    azure: "bg-sky-50",
    amber: "bg-amber-50",
    violet: "bg-violet-50",
    ocean: "bg-teal-50",
    citrus: "bg-lime-50",
    sunset: "bg-orange-50",
    mint: "bg-green-50",
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
            <ProgramButtons
              programMode={programMode}
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
        <V2Map busNumber={selectedBusNumber.value as "420" | "438"} />

        {/* Color scheme toggle */}
        <ColorSchemeToggle colorScheme={colorScheme} />

        {/* Footer toggle */}
        <DesignToggleFooter designVersion={designVersion} />
      </div>
    </div>
  );
}
