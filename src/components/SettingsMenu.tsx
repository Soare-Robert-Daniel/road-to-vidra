import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { BusSelector } from "./BusSelector";
import { ProgramModeButtons } from "./ProgramModeButtons";
import { DaySelector } from "./DaySelector";
import { AutoButton } from "./AutoButton";
import { HoursViewSelector } from "./HoursViewSelector";

interface SettingsMenuProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  showNextDayProgram: Signal<boolean>;
  showPastHours: Signal<boolean>;
  isWeekendProgram: boolean;
  holidayName: string | null;
  className?: string;
}

export function SettingsMenu({
  selectedBusNumber,
  programMode,
  showNextDayProgram,
  showPastHours,
  isWeekendProgram,
  holidayName,
  className,
}: SettingsMenuProps): JSX.Element {
  let currentScheduleType: "lucru" | "weekend";
  if (programMode.value === "auto") {
    currentScheduleType = isWeekendProgram ? "weekend" : "lucru";
  } else {
    currentScheduleType = programMode.value;
  }

  return (
    <div class={twMerge("bg-white rounded-lg shadow-sm p-2 mb-2", className)}>
      <div class={twMerge("flex flex-col gap-2")}>
        {/* First row: Bus selection and schedule type */}
        <div class={twMerge("flex items-center justify-between gap-2")}>
          <BusSelector selectedBusNumber={selectedBusNumber} />
          <ProgramModeButtons
            programMode={programMode}
            currentScheduleType={currentScheduleType}
          />
        </div>

        {/* Second row: Day selector and Hours view selector */}
        <div class={twMerge("flex items-center justify-between")}>
          <DaySelector showNextDayProgram={showNextDayProgram} />
          <div class="flex items-center gap-4">
            <HoursViewSelector showPastHours={showPastHours} />
            {/* <AutoButton programMode={programMode} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
