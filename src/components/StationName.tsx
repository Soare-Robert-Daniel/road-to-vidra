import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

interface StationNameProps {
  label: string;
  busNumber: string;
  className?: string;
}

export function StationName({
  label,
  busNumber,
  className,
}: StationNameProps): JSX.Element {
  return (
    <div
      class={twMerge(
        "border-b border-gray-200 pb-1 mb-1 select-none",
        className
      )}
    >
      <h3 class={twMerge("text-base font-semibold text-gray-800")}>
        {busNumber} {"420" === busNumber ? "🌿" : "😩"} - {label}
      </h3>
    </div>
  );
}
