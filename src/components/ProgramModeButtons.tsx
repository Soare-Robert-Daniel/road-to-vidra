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
    "flex-1 min-w-9 px-2 py-1 text-base leading-none font-medium rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 sm:min-w-10 sm:px-2.5 sm:py-1.5 sm:text-lg";
  // Active: raised button with soft shadow (tactile, elevated)
  const selectedClass = "bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
  // Inactive: recessed into the track (scobitură effect)
  const unselectedClass = "bg-transparent opacity-60 hover:opacity-100";

  return (
    <div
      class={twMerge(
        "flex w-full items-center gap-0.5 bg-slate-100/80 rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]",
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
