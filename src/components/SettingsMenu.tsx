import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { BusSelector } from "./BusSelector";
import { ProgramModeButtons } from "./ProgramModeButtons";
import { HoursViewSelector } from "./HoursViewSelector";
import { type ViewMode } from "../storage";

interface SettingsMenuProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  showPastHours: Signal<boolean>;
  viewMode: Signal<ViewMode>;
  isWeekendProgram: boolean;
  holidayName: string | null;
  className?: string;
}

export function SettingsMenu({
  selectedBusNumber,
  programMode,
  viewMode,
  isWeekendProgram,
  className,
}: SettingsMenuProps): JSX.Element {
  let currentScheduleType: "lucru" | "weekend";
  if (programMode.value === "auto") {
    currentScheduleType = isWeekendProgram ? "weekend" : "lucru";
  } else {
    currentScheduleType = programMode.value;
  }

  return (
    <div
      class={twMerge(
        "bg-white rounded-2xl shadow-sm px-1.5 py-1.5 mb-1.5 sm:mb-2 sm:px-2 sm:py-2",
        className,
      )}
    >
      <div class={twMerge("flex items-center gap-1 sm:gap-1.5")}>
        <BusSelector selectedBusNumber={selectedBusNumber} className="shrink-0" />
        <ProgramModeButtons
          programMode={programMode}
          currentScheduleType={currentScheduleType}
          className="min-w-0 flex-1"
        />
        <HoursViewSelector viewMode={viewMode} className="shrink-0" />
      </div>
    </div>
  );
}
