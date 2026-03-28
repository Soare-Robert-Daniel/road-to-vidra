import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface BusSelectorProps {
  selectedBusNumber: Signal<string>;
  className?: string;
}

export function BusSelector({ selectedBusNumber, className }: BusSelectorProps): JSX.Element {
  const baseButtonClass =
    "min-w-11 px-2.5 py-1 text-sm font-medium rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 sm:min-w-12 sm:px-3 sm:py-1.5 sm:text-base";
  // Active: raised button with soft shadow (tactile, elevated)
  const selectedClass =
    "bg-white text-blue-600 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
  // Inactive: recessed into the track (scobitură effect)
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  return (
    <div
      class={twMerge(
        "inline-flex items-center gap-0.5 bg-slate-100/80 rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <button
        type="button"
        class={twMerge(
          baseButtonClass,
          selectedBusNumber.value === "420" ? selectedClass : unselectedClass,
        )}
        onClick={() => (selectedBusNumber.value = "420")}
      >
        420
      </button>
      <button
        type="button"
        class={twMerge(
          baseButtonClass,
          selectedBusNumber.value === "438" ? selectedClass : unselectedClass,
        )}
        onClick={() => (selectedBusNumber.value = "438")}
      >
        438
      </button>
    </div>
  );
}
