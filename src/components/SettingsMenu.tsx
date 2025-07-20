import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { BusSelector } from "./BusSelector";
import { ProgramModeButtons } from "./ProgramModeButtons";
import { NextDayToggle } from "./NextDayToggle";
import { AutoButton } from "./AutoButton";

interface SettingsMenuProps {
  selectedBusNumber: Signal<string>;
  programMode: Signal<"auto" | "lucru" | "weekend">;
  showNextDayProgram: Signal<boolean>;
  isWeekendProgram: boolean;
  holidayName: string | null;
}

export function SettingsMenu({
  selectedBusNumber,
  programMode,
  showNextDayProgram,
  isWeekendProgram,
  holidayName,
}: SettingsMenuProps): JSX.Element {
  let currentScheduleType: "lucru" | "weekend";
  if (programMode.value === "auto") {
    currentScheduleType = isWeekendProgram ? "weekend" : "lucru";
  } else {
    currentScheduleType = programMode.value;
  }

  return (
    <div class="bg-white rounded-lg shadow-sm p-2 mb-2">
      <div class="flex flex-col gap-2">
        {/* First row: Bus selection and schedule type */}
        <div class="flex items-center justify-between gap-2">
          <BusSelector selectedBusNumber={selectedBusNumber} />
          <ProgramModeButtons
            programMode={programMode}
            currentScheduleType={currentScheduleType}
          />
        </div>

        {/* Second row: Next day toggle and Auto button */}
        <div class="flex items-center justify-between">
          <NextDayToggle showNextDayProgram={showNextDayProgram} />
          <AutoButton programMode={programMode} />
        </div>
      </div>
    </div>
  );
}
