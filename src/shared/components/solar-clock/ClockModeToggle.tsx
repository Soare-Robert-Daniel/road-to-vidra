import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ClockDisplayMode, type ColorScheme } from "../../utils/storage";
import { getSelectedClass, getContainerBg } from "../color-scheme";

interface ClockModeToggleProps {
  clockDisplayMode: Signal<ClockDisplayMode>;
  colorScheme?: Signal<ColorScheme>;
  className?: string;
  availableModes?: ClockDisplayMode[];
}

export function ClockModeToggle({
  clockDisplayMode,
  colorScheme,
  className,
  availableModes,
}: ClockModeToggleProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const baseButtonClass =
    "px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const selectedClass = getSelectedClass(scheme);
  const containerBg = getContainerBg(scheme);
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  const modes: { key: ClockDisplayMode; label: string; aria: string }[] = [
    { key: "round", label: "Ceas", aria: "Afisare ceas rotund" },
    { key: "poster", label: "Poster", aria: "Afisare poster" },
    { key: "tabel", label: "Tabel", aria: "Afisare tabel" },
    { key: "timeline", label: "Linie", aria: "Afisare timeline" },
  ];

  const filteredModes = availableModes
    ? modes.filter((m) => availableModes.includes(m.key))
    : modes;

  return (
    <div
      class={twMerge(
        `font-ui inline-flex items-center gap-0.5 ${containerBg} rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]`,
        className,
      )}
    >
      {filteredModes.map((mode) => (
        <button
          key={mode.key}
          type="button"
          aria-label={mode.aria}
          class={twMerge(
            baseButtonClass,
            clockDisplayMode.value === mode.key ? selectedClass : unselectedClass,
          )}
          onClick={() => (clockDisplayMode.value = mode.key)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
