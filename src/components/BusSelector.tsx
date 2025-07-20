import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface BusSelectorProps {
  selectedBusNumber: Signal<string>;
}

export function BusSelector({
  selectedBusNumber,
}: BusSelectorProps): JSX.Element {
  return (
    <div class="flex items-center gap-1">
      <span class="font-medium text-gray-700 text-base">Bus:</span>
      <select
        class="border border-gray-300 rounded px-2 py-1 text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={selectedBusNumber.value}
        onChange={(e) =>
          (selectedBusNumber.value = (e.target as HTMLSelectElement).value)
        }
      >
        <option value="420">420</option>
        <option value="438">438</option>
      </select>
    </div>
  );
}
