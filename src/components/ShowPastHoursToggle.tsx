import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

interface ShowPastHoursToggleProps {
  showPastHours: Signal<boolean>;
  className?: string;
}

export function ShowPastHoursToggle({
  showPastHours,
  className,
}: ShowPastHoursToggleProps): JSX.Element {
  const handleToggle = () => {
    showPastHours.value = !showPastHours.value;
  };

  return (
    <div class={twMerge("flex items-center gap-2", className)}>
      <button
        onClick={handleToggle}
        class={twMerge(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          showPastHours.value ? "bg-blue-600" : "bg-gray-300"
        )}
        type="button"
        role="switch"
        aria-checked={showPastHours.value}
        aria-label="Afișează ore trecute"
      >
        <span
          class={twMerge(
            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
            showPastHours.value ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
      <label class="text-base text-gray-600">Ore trecute</label>
    </div>
  );
}
