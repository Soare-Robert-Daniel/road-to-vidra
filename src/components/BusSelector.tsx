import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface BusSelectorProps {
  selectedBusNumber: Signal<string>;
  className?: string;
}

export function BusSelector({
  selectedBusNumber,
  className,
}: BusSelectorProps): JSX.Element {
  const baseButtonClass =
    "min-w-11 px-2.5 py-1 text-sm font-bold rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:ring-offset-gray-100 sm:min-w-12 sm:px-3 sm:py-1.5 sm:text-base";
  const selectedClass = "bg-white text-blue-600 shadow-sm";
  const unselectedClass = "bg-transparent text-gray-500 hover:text-gray-800";

  return (
    <div
      class={twMerge(
        "inline-flex items-center gap-0.5 bg-gray-100 rounded-2xl p-0.5 shadow-inner",
        className,
      )}
    >
      <button
        type="button"
        class={twMerge(
          baseButtonClass,
          selectedBusNumber.value === "420" ? selectedClass : unselectedClass,
        )}
        onClick={() => (selectedBusNumber.value = "420")}
      >
        420
      </button>
      <button
        type="button"
        class={twMerge(
          baseButtonClass,
          selectedBusNumber.value === "438" ? selectedClass : unselectedClass,
        )}
        onClick={() => (selectedBusNumber.value = "438")}
      >
        438
      </button>
    </div>
  );
}
