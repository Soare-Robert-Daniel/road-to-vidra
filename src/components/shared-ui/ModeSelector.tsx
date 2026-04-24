import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ColorScheme } from "../../storage";

interface ModeSelectorProps {
  designVersion: Signal<"classic" | "modern" | "experimental">;
  colorScheme?: Signal<ColorScheme>;
}

function getSelectedClass(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "bg-slate-100 text-slate-800 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "slate-dark":
      return "bg-slate-700 text-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "midnight":
      return "bg-indigo-800 text-indigo-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "forest":
      return "bg-green-800 text-green-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "rust":
      return "bg-red-800 text-red-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "ocean-deep":
      return "bg-teal-800 text-teal-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "grape":
      return "bg-purple-800 text-purple-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
    case "charcoal":
      return "bg-zinc-700 text-zinc-100 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]";
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

export function ModeSelector({
  designVersion,
  colorScheme,
}: ModeSelectorProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const baseButtonClass =
    "px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-[11px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const selectedClass = getSelectedClass(scheme);
  const containerBg = getContainerBg(scheme);
  const unselectedClass = "bg-transparent text-slate-400 hover:text-slate-600";

  const modes: { key: "classic" | "modern" | "experimental"; label: string }[] = [
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
