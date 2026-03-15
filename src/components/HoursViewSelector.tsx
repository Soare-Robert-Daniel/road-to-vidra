import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { type ViewMode } from "../storage";

interface HoursViewSelectorProps {
  viewMode: Signal<ViewMode>;
  className?: string;
}

export function HoursViewSelector({ viewMode, className }: HoursViewSelectorProps): JSX.Element {
  const baseButtonClass =
    "min-w-9 px-1.5 py-1 text-base leading-none font-bold rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:ring-offset-gray-100 sm:min-w-10 sm:px-2 sm:py-1.5";
  const selectedClass = "bg-white text-blue-600 shadow-sm opacity-100";
  const unselectedClass =
    "bg-transparent text-gray-500 opacity-65 hover:text-gray-800 hover:opacity-100";

  return (
    <div
      class={twMerge(
        "inline-flex items-center gap-0.5 bg-gray-100 rounded-2xl p-0.5 shadow-inner",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Afisare tabel"
        title="Afisare tabel"
        class={twMerge(
          baseButtonClass,
          viewMode.value === "table" ? selectedClass : unselectedClass,
        )}
        onClick={() => (viewMode.value = "table")}
      >
        📋
      </button>
      <button
        type="button"
        aria-label="Afisare ceas"
        title="Afisare ceas"
        class={twMerge(
          baseButtonClass,
          viewMode.value === "clock" ? selectedClass : unselectedClass,
        )}
        onClick={() => (viewMode.value = "clock")}
      >
        🕒
      </button>
    </div>
  );
}
