import type { ColorScheme } from "../../utils/storage";

// Shared color scheme style utilities used across multiple components

export function getSelectedClass(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "bg-slate-100 text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
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
      return "bg-rose-50 text-rose-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "azure":
      return "bg-sky-50 text-sky-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "amber":
      return "bg-amber-50 text-amber-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "violet":
      return "bg-violet-50 text-violet-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "ocean":
      return "bg-teal-50 text-teal-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "citrus":
      return "bg-lime-50 text-lime-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "sunset":
      return "bg-orange-50 text-orange-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    case "mint":
      return "bg-green-50 text-green-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
    default:
      return "bg-emerald-50 text-emerald-700 shadow-[0_2px_6px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]";
  }
}

export function getContainerBg(colorScheme: ColorScheme): string {
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

// Background colors for app containers
export function getAppBgClass(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "bg-white text-slate-900";
    case "slate-dark":
      return "bg-slate-900 text-slate-100";
    case "midnight":
      return "bg-indigo-950 text-indigo-100";
    case "forest":
      return "bg-green-950 text-green-100";
    case "rust":
      return "bg-red-950 text-red-100";
    case "ocean-deep":
      return "bg-teal-950 text-teal-100";
    case "grape":
      return "bg-purple-950 text-purple-100";
    case "charcoal":
      return "bg-zinc-900 text-zinc-100";
    case "eliza":
      return "bg-rose-50 text-slate-900";
    case "azure":
      return "bg-sky-50 text-slate-900";
    case "amber":
      return "bg-amber-50 text-slate-900";
    case "violet":
      return "bg-violet-50 text-slate-900";
    case "ocean":
      return "bg-teal-50 text-slate-900";
    case "citrus":
      return "bg-lime-50 text-slate-900";
    case "sunset":
      return "bg-orange-50 text-slate-900";
    case "mint":
      return "bg-green-50 text-slate-900";
    default:
      return "bg-slate-50 text-slate-900";
  }
}

export function isDarkScheme(colorScheme: ColorScheme): boolean {
  return (
    colorScheme.endsWith("-dark") ||
    ["midnight", "forest", "rust", "ocean-deep", "grape", "charcoal"].includes(colorScheme)
  );
}
