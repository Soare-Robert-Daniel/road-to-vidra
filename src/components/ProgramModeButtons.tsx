import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface ProgramModeButtonsProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
  currentScheduleType: "lucru" | "weekend";
}

export function ProgramModeButtons({
  programMode,
  currentScheduleType,
}: ProgramModeButtonsProps): JSX.Element {
  return (
    <div class="flex items-center gap-1">
      <button
        class={`px-2 py-1 text-base rounded transition-colors ${
          currentScheduleType === "lucru"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => (programMode.value = "lucru")}
      >
        Lucru
      </button>
      <button
        class={`px-2 py-1 text-base rounded transition-colors ${
          currentScheduleType === "weekend"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => (programMode.value = "weekend")}
      >
        Weekend
      </button>
    </div>
  );
}
