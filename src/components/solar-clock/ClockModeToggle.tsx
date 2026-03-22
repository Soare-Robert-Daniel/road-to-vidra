import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ClockDisplayMode } from "../../storage";

interface ClockModeToggleProps {
  clockDisplayMode: Signal<ClockDisplayMode>;
  className?: string;
}

export function ClockModeToggle({
  clockDisplayMode,
  className,
}: ClockModeToggleProps): JSX.Element {
  const baseButtonClass =
    "px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  // Active: raised button with soft shadow (tactile, elevated)
  const selectedClass = "bg-white text-slate-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
  // Inactive: recessed into the track (scobitură effect)
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  return (
    <div
      class={twMerge(
        "font-ui inline-flex items-center gap-0.5 rounded-2xl bg-slate-100/80 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Afisare ceas rotund"
        class={twMerge(
          baseButtonClass,
          clockDisplayMode.value === "round" ? selectedClass : unselectedClass,
        )}
        onClick={() => (clockDisplayMode.value = "round")}
      >
        Ceas
      </button>
      <button
        type="button"
        aria-label="Afisare poster"
        class={twMerge(
          baseButtonClass,
          clockDisplayMode.value === "poster" ? selectedClass : unselectedClass,
        )}
        onClick={() => (clockDisplayMode.value = "poster")}
      >
        Poster
      </button>
    </div>
  );
}
