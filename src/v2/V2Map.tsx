import { JSX } from "preact";
import { MapView } from "../components/solar-clock";

interface V2MapProps {
  busNumber: "420" | "438";
}

export function V2Map({ busNumber }: V2MapProps): JSX.Element {
  return (
    <div class="p-2">
      <div class="text-sm font-bold mb-1">Hartă autobuz</div>
      <MapView busNumber={busNumber} />
    </div>
  );
}
