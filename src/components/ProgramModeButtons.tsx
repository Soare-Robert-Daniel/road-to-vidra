import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface ProgramModeButtonsProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
  currentScheduleType: "lucru" | "weekend";
  className?: string;
}

export function ProgramModeButtons({
  programMode,
  currentScheduleType,
  className,
}: ProgramModeButtonsProps): JSX.Element {
  const baseButtonClass =
    "px-4 py-1.5 text-base font-bold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-100";
  const selectedClass = "bg-white text-blue-600 shadow-md";
  const unselectedClass = "bg-transparent text-gray-500 hover:text-gray-800";

  return (
    <div
      class={twMerge(
        "flex items-center gap-1 bg-gray-100 rounded-xl p-1 shadow-inner",
        className
      )}
    >
      <button
        class={twMerge(
          baseButtonClass,
          currentScheduleType === "lucru" ? selectedClass : unselectedClass
        )}
        onClick={() => (programMode.value = "lucru")}
      >
        Lucru
      </button>
      <button
        class={twMerge(
          baseButtonClass,
          currentScheduleType === "weekend" ? selectedClass : unselectedClass
        )}
        onClick={() => (programMode.value = "weekend")}
      >
        Weekend
      </button>
    </div>
  );
}
