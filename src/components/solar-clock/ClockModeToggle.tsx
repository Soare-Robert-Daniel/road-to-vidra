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
    "px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:ring-offset-gray-100";
  const selectedClass = "bg-white text-slate-800 shadow-sm";
  const unselectedClass =
    "bg-transparent text-slate-400 hover:text-slate-600";

  return (
    <div
      class={twMerge(
        "font-ui inline-flex items-center gap-0.5 rounded-2xl bg-gray-100 p-0.5 shadow-inner",
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
