import { JSX } from "preact";

import type { SolarTimesSummary } from "../../solar";

import {
  CENTER,
  CLOCK_COLORS,
  SOLAR_BAND_STYLE,
  getArcPath,
} from "./constants";

interface SolarBandProps {
  solarTimes: SolarTimesSummary;
  daylightId: string;
}

export function SolarBand({
  solarTimes,
  daylightId,
}: SolarBandProps): JSX.Element {
  const daylightArcPath = getArcPath(
    solarTimes.sunriseMinutes,
    solarTimes.sunsetMinutes,
    SOLAR_BAND_STYLE.radius,
  );

  return (
    <>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={SOLAR_BAND_STYLE.radius}
        fill="none"
        stroke={CLOCK_COLORS.solarBandBase}
        stroke-width={String(SOLAR_BAND_STYLE.width)}
        opacity={String(SOLAR_BAND_STYLE.baseOpacity)}
        stroke-linecap="round"
      />
      <path
        d={daylightArcPath}
        fill="none"
        stroke={`url(#${daylightId})`}
        stroke-width={String(SOLAR_BAND_STYLE.width)}
        stroke-linecap="round"
      />
    </>
  );
}
