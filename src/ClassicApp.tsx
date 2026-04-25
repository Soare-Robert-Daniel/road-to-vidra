import { JSX } from "preact";
import { Signal, signal } from "@preact/signals";

import { type ColorScheme } from "./storage";
import { ModeSelector } from "./components/shared-ui/ModeSelector";

import { BusButtons } from "./v2/BusButtons";
import { ProgramButtons } from "./v2/ProgramButtons";
import { HoursColumns } from "./v2/HoursColumns";
import { V2Map } from "./v2/V2Map";
import { ColorSchemeToggle } from "./v2/ColorSchemeToggle";

// Local program mode signal (no "auto" mode for classic)
const programMode = signal<"lucru" | "weekend">("lucru");

interface ClassicAppProps {
  selectedBusNumber: Signal<string>;
  designVersion: Signal<"classic" | "modern" | "experimental">;
  colorScheme: Signal<ColorScheme>;
}

export function ClassicApp({
  selectedBusNumber,
  designVersion,
  colorScheme,
}: ClassicAppProps): JSX.Element {
  const useWeekendSchedule = programMode.value === "weekend";
  const scheme = colorScheme.value;

  const bgColor = {
    white: "bg-white text-slate-900",
    emerald: "bg-slate-50 text-slate-900",
    eliza: "bg-rose-50 text-slate-900",
    azure: "bg-sky-50 text-slate-900",
    amber: "bg-amber-50 text-slate-900",
    violet: "bg-violet-50 text-slate-900",
    ocean: "bg-teal-50 text-slate-900",
    citrus: "bg-lime-50 text-slate-900",
    sunset: "bg-orange-50 text-slate-900",
    mint: "bg-green-50 text-slate-900",
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

        {/* Mode selector */}
        <ModeSelector designVersion={designVersion} colorScheme={colorScheme} />
      </div>
    </div>
  );
}
