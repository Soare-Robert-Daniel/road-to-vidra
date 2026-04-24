import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ClockDisplayMode, type ColorScheme } from "../../storage";

interface ClockModeToggleProps {
  clockDisplayMode: Signal<ClockDisplayMode>;
  colorScheme?: Signal<ColorScheme>;
  className?: string;
}

function getSelectedClass(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "eliza":
      return "bg-rose-50 text-rose-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "azure":
      return "bg-sky-50 text-sky-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "amber":
      return "bg-amber-50 text-amber-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "violet":
      return "bg-violet-50 text-violet-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "ocean":
      return "bg-teal-50 text-teal-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "citrus":
      return "bg-lime-50 text-lime-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "sunset":
      return "bg-orange-50 text-orange-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "mint":
      return "bg-green-50 text-green-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    default:
      return "bg-emerald-50 text-emerald-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
  }
}

function getContainerBg(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "eliza":
      return "bg-rose-100/80";
    case "azure":
      return "bg-sky-100/80";
    case "amber":
      return "bg-amber-100/80";
    case "violet":
      return "bg-violet-100/80";
    case "ocean":
      return "bg-teal-100/80";
    case "citrus":
      return "bg-lime-100/80";
    case "sunset":
      return "bg-orange-100/80";
    case "mint":
      return "bg-green-100/80";
    default:
      return "bg-emerald-100/80";
  }
}

export function ClockModeToggle({
  clockDisplayMode,
  colorScheme,
  className,
}: ClockModeToggleProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const baseButtonClass =
    "px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const selectedClass = getSelectedClass(scheme);
  const containerBg = getContainerBg(scheme);
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  return (
    <div
      class={twMerge(
        `font-ui inline-flex items-center gap-0.5 ${containerBg} rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]`,
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
      <button
        type="button"
        aria-label="Afisare tabel"
        class={twMerge(
          baseButtonClass,
          clockDisplayMode.value === "tabel" ? selectedClass : unselectedClass,
        )}
        onClick={() => (clockDisplayMode.value = "tabel")}
      >
        Tabel
      </button>
      <button
        type="button"
        aria-label="Afisare timeline"
        class={twMerge(
          baseButtonClass,
          clockDisplayMode.value === "timeline" ? selectedClass : unselectedClass,
        )}
        onClick={() => (clockDisplayMode.value = "timeline")}
      >
        Linie
      </button>
    </div>
  );
}
