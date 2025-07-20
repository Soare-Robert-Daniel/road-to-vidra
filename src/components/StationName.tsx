import { JSX } from "preact";

interface StationNameProps {
  label: string;
  busNumber: string;
}

export function StationName({
  label,
  busNumber,
}: StationNameProps): JSX.Element {
  return (
    <div class="border-b border-gray-200 pb-1 mb-1">
      <h3 class="text-sm font-semibold text-gray-800">
        {busNumber} - {label}
      </h3>
    </div>
  );
}
