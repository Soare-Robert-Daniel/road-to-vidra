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
  const handleToggle = () => {
    showNextDayProgram.value = !showNextDayProgram.value;
  };

  return (
    <div class={twMerge("flex items-center gap-2", className)}>
      <button
        onClick={handleToggle}
        class={twMerge(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          showNextDayProgram.value ? "bg-blue-600" : "bg-gray-300"
        )}
        type="button"
        role="switch"
        aria-checked={showNextDayProgram.value}
        aria-label="Arată program mâine"
      >
        <span
          class={twMerge(
            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
            showNextDayProgram.value ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
      <label
        onClick={handleToggle}
        class={twMerge("text-base text-gray-600 cursor-pointer")}
      >
        Arată program mâine
      </label>
    </div>
  );
}
