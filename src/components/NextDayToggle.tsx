import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface NextDayToggleProps {
  showNextDayProgram: Signal<boolean>;
  className?: string;
}

export function NextDayToggle({
  showNextDayProgram,
  className,
}: NextDayToggleProps): JSX.Element {
  return (
    <label
      class={twMerge(
        "flex items-center gap-3 text-base text-gray-700 cursor-pointer select-none group",
        className
      )}
    >
      <div class={twMerge("relative")}>
        <input
          type="checkbox"
          checked={showNextDayProgram.value}
          onChange={(e) =>
            (showNextDayProgram.value = (e.target as HTMLInputElement).checked)
          }
          class={twMerge("sr-only")} // Hide original checkbox
        />
        <div
          class={twMerge(
            "w-10 h-5 bg-gray-200 rounded-full shadow-inner transition-colors duration-200 ease-in-out group-hover:bg-gray-300"
          )}
        ></div>
        <div
          class={twMerge(
            "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out",
            showNextDayProgram.value ? "translate-x-5 bg-blue-500" : ""
          )}
        ></div>
      </div>
      <span
        class={twMerge("font-bold group-hover:text-gray-900 transition-colors")}
      >
        Arată program mâine
      </span>
    </label>
  );
}
