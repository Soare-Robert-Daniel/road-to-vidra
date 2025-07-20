import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to merge Tailwind CSS classes using twMerge and clsx
 * This combines the power of clsx for conditional classes with twMerge for Tailwind class conflicts
 * 
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Create theme-specific classes for bus lines
 */
export const getBusThemeClasses = (busNumber: string, direction: string) => {
  const themes = {
    "420": {
      tur: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-400",
        nextBg: "bg-blue-100",
        nextBorder: "border-blue-500",
        nextText: "text-blue-800",
        remainingText: "text-blue-600",
        nextRemainingText: "text-blue-600",
      },
      retur: {
        bg: "bg-green-50",
        text: "text-green-800",
        border: "border-green-400",
        nextBg: "bg-green-100",
        nextBorder: "border-green-500",
        nextText: "text-green-800",
        remainingText: "text-green-600",
        nextRemainingText: "text-green-600",
      },
    },
    "438": {
      tur: {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-400",
        nextBg: "bg-red-100",
        nextBorder: "border-red-500",
        nextText: "text-red-800",
        remainingText: "text-red-600",
        nextRemainingText: "text-red-600",
      },
      retur: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        border: "border-purple-400",
        nextBg: "bg-purple-100",
        nextBorder: "border-purple-500",
        nextText: "text-purple-800",
        remainingText: "text-purple-600",
        nextRemainingText: "text-purple-600",
      },
    },
  };

  return themes[busNumber as keyof typeof themes]?.[direction as keyof typeof themes["420"]] || themes["420"].tur;
};
