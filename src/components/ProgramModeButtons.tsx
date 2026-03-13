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
    "flex-1 min-w-9 px-2 py-1 text-base leading-none font-bold rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:ring-offset-gray-100 sm:min-w-10 sm:px-2.5 sm:py-1.5 sm:text-lg";
  const selectedClass = "bg-white shadow-sm opacity-100";
  const unselectedClass = "bg-transparent opacity-60 hover:opacity-100";

  return (
    <div
      class={twMerge(
        "flex w-full items-center gap-0.5 bg-gray-100 rounded-2xl p-0.5 shadow-inner",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Program de lucru"
        title="Program de lucru"
        class={twMerge(
          baseButtonClass,
          currentScheduleType === "lucru" ? selectedClass : unselectedClass,
        )}
        onClick={() => (programMode.value = "lucru")}
      >
        💼
      </button>
      <button
        type="button"
        aria-label="Program de weekend"
        title="Program de weekend"
        class={twMerge(
          baseButtonClass,
          currentScheduleType === "weekend" ? selectedClass : unselectedClass,
        )}
        onClick={() => (programMode.value = "weekend")}
      >
        🌴
      </button>
    </div>
  );
}
