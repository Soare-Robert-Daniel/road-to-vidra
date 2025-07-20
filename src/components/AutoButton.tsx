import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface AutoButtonProps {
  programMode: Signal<"auto" | "lucru" | "weekend">;
}

export function AutoButton({ programMode }: AutoButtonProps): JSX.Element {
  return (
    <button
      class={`px-2 py-1 text-xs rounded transition-colors ${
        programMode.value === "auto"
          ? "bg-green-500 text-white"
          : "bg-gray-200 text-gray-700"
      }`}
      onClick={() => (programMode.value = "auto")}
    >
      Auto
    </button>
  );
}
