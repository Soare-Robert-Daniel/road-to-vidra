import { JSX } from "preact";
import { Signal, signal } from "@preact/signals";

import { type DesignVersion } from "../storage";
import { DesignToggleFooter } from "../components/shared-ui/DesignToggleFooter";

import { BusButtons } from "./BusButtons";
import { ProgramButtons } from "./ProgramButtons";
import { HoursColumns } from "./HoursColumns";
import { V2Map } from "./V2Map";

// Local program mode signal (no "auto" mode for v2)
const programMode = signal<"lucru" | "weekend">("lucru");

interface V2AppProps {
  selectedBusNumber: Signal<string>;
  designVersion: Signal<DesignVersion>;
}

export function V2App({
  selectedBusNumber,
  designVersion,
}: V2AppProps): JSX.Element {
  const useWeekendSchedule = programMode.value === "weekend";

  return (
    <div class="min-h-screen p-2">
      <div class="max-w-4xl mx-auto">
        {/* Top row: Bus (1/4) | Program (3/4) */}
        <div class="grid grid-cols-6 gap-4 p-2 border-b">
          <div class="col-span-2">
            <BusButtons selectedBusNumber={selectedBusNumber} />
          </div>
          <div class="col-span-4">
            <ProgramButtons programMode={programMode} />
          </div>
        </div>

        {/* Hours columns */}
        <HoursColumns
          busNumber={selectedBusNumber.value}
          useWeekendSchedule={useWeekendSchedule}
        />

        {/* Map with embedded BusDataTable */}
        <V2Map busNumber={selectedBusNumber.value as "420" | "438"} />

        {/* Footer toggle */}
        <DesignToggleFooter designVersion={designVersion} />
      </div>
    </div>
  );
}
