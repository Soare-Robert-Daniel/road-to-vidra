import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface NextDayToggleProps {
  showNextDayProgram: Signal<boolean>;
}

export function NextDayToggle({
  showNextDayProgram,
}: NextDayToggleProps): JSX.Element {
  return (
    <label class="flex items-center gap-2 text-base text-gray-700">
      <input
        type="checkbox"
        checked={showNextDayProgram.value}
        onChange={(e) =>
          (showNextDayProgram.value = (e.target as HTMLInputElement).checked)
        }
        class="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
      />
      <span>Arată program mâine</span>
    </label>
  );
}
