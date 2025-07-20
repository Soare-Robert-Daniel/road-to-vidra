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
  return (
    <div class={twMerge("relative flex items-center", className)}>
      <span
        class={twMerge("absolute left-3 font-bold text-gray-600 text-base")}
      >
        Bus:
      </span>
      <select
        class={twMerge(
          "appearance-none border-2 border-gray-200 rounded-xl px-10 py-2 text-base font-bold bg-white shadow-inner cursor-pointer",
          "transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        )}
        value={selectedBusNumber.value}
        onChange={(e) =>
          (selectedBusNumber.value = (e.target as HTMLSelectElement).value)
        }
      >
        <option value="420">420</option>
        <option value="438">438</option>
      </select>
      <div
        class={twMerge(
          "absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        )}
      >
        <svg
          class={twMerge("w-4 h-4 text-gray-500")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>
  );
}
