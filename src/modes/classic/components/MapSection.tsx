import { JSX } from "preact";
import { MapView } from "../../../shared/components/solar-clock";

interface MapSectionProps {
  busNumber: "420" | "438";
}

export function MapSection({ busNumber }: MapSectionProps): JSX.Element {
  return (
    <div class="p-2">
      <div class="text-sm font-bold mb-1">Hartă autobuz</div>
      <MapView busNumber={busNumber} />
    </div>
  );
}
