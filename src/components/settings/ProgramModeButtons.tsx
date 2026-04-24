import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { type ColorScheme } from "../../storage";

interface ProgramModeButtonsProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
  currentScheduleType: "lucru" | "weekend";
  colorScheme?: Signal<ColorScheme>;
  className?: string;
}

function getSelectedClass(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "bg-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "slate-dark":
      return "bg-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "midnight":
      return "bg-indigo-800 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "forest":
      return "bg-green-800 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "rust":
      return "bg-red-800 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "ocean-deep":
      return "bg-teal-800 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "grape":
      return "bg-purple-800 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "charcoal":
      return "bg-zinc-700 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] opacity-100";
    case "eliza":
      return "bg-rose-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "azure":
      return "bg-sky-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "amber":
      return "bg-amber-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "violet":
      return "bg-violet-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "ocean":
      return "bg-teal-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "citrus":
      return "bg-lime-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "sunset":
      return "bg-orange-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    case "mint":
      return "bg-green-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
    default:
      return "bg-emerald-50 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)] opacity-100";
  }
}

function getContainerBg(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "bg-slate-100/80";
    case "slate-dark":
      return "bg-slate-800/80";
    case "midnight":
      return "bg-indigo-900/80";
    case "forest":
      return "bg-green-900/80";
    case "rust":
      return "bg-red-900/80";
    case "ocean-deep":
      return "bg-teal-900/80";
    case "grape":
      return "bg-purple-900/80";
    case "charcoal":
      return "bg-zinc-800/80";
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

export function ProgramModeButtons({
  programMode,
  currentScheduleType,
  colorScheme,
  className,
}: ProgramModeButtonsProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const baseButtonClass =
    "flex-1 min-w-9 px-2 py-1 text-base leading-none font-medium rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 sm:min-w-10 sm:px-2.5 sm:py-1.5 sm:text-lg flex items-center justify-center gap-1";
  const selectedClass = getSelectedClass(scheme);
  const containerBg = getContainerBg(scheme);
  const unselectedClass = "bg-transparent opacity-60 hover:opacity-100";

  return (
    <div
      class={twMerge(
        `flex w-full items-center gap-0.5 ${containerBg} rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]`,
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
        <span>💼</span>
        <span class="text-sm font-semibold">L-V</span>
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
        <span>🌴</span>
        <span class="text-sm font-semibold">S-D</span>
      </button>
    </div>
  );
}
