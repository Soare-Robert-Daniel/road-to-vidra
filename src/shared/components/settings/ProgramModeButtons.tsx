import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";
import { type ColorScheme } from "../../utils/storage";
import { getSelectedClass, getContainerBg } from "../color-scheme";

interface ProgramModeButtonsProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
  currentScheduleType: "lucru" | "weekend";
  colorScheme?: Signal<ColorScheme>;
  className?: string;
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
