import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ColorScheme, type DesignVersion } from "../../utils/storage";
import { getSelectedClass, getContainerBg } from "../color-scheme";

interface ModeSelectorProps {
  designVersion: Signal<DesignVersion>;
  colorScheme?: Signal<ColorScheme>;
}

export function ModeSelector({ designVersion, colorScheme }: ModeSelectorProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const baseButtonClass =
    "px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const selectedClass = getSelectedClass(scheme);
  const containerBg = getContainerBg(scheme);
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  const modes: { key: DesignVersion; label: string }[] = [
    { key: "classic", label: "Classic" },
    { key: "modern", label: "Modern" },
    { key: "experimental", label: "Exp." },
  ];

  return (
    <footer class="mt-6 mb-4 flex justify-center">
      <div
        class={twMerge(
          `font-ui inline-flex items-center gap-0.5 ${containerBg} rounded-2xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)]`,
        )}
      >
        {modes.map((mode) => (
          <button
            key={mode.key}
            type="button"
            class={twMerge(
              baseButtonClass,
              designVersion.value === mode.key ? selectedClass : unselectedClass,
            )}
            onClick={() => {
              designVersion.value = mode.key;
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </footer>
  );
}
