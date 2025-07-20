import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface AutoButtonProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
  className?: string;
}

export function AutoButton({
  programMode,
  className,
}: AutoButtonProps): JSX.Element {
  const isAuto = programMode.value === "auto";

  const baseClasses =
    "px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-100 active:scale-95";
  const activeClasses = "bg-green-500 text-white shadow-md hover:bg-green-600";
  const inactiveClasses =
    "bg-white text-gray-600 shadow-sm hover:shadow-md hover:text-gray-900";

  return (
    <button
      class={twMerge(
        baseClasses,
        isAuto ? activeClasses : inactiveClasses,
        className
      )}
      onClick={() => (programMode.value = "auto")}
    >
      Auto
    </button>
  );
}
