import { JSX } from "preact";

import type { SolarTimesSummary } from "../../solar";

import { SOLAR_BAND_STYLE, getArcPath, getPointOnCircle } from "./constants";

interface SolarBandProps {
  solarTimes: SolarTimesSummary;
}

/**
 * Renders a thin split sky ring on the clock perimeter.
 *
 * Draws:
 * - Daylight arc (sunrise → sunset) in a warm neutral tone
 * - Night arc (sunset → sunrise) in a cool neutral tone
 * - Small dot markers at sunrise and sunset positions
 */
export function SolarBand({ solarTimes }: SolarBandProps): JSX.Element {
  const { sunriseMinutes, sunsetMinutes } = solarTimes;
  const {
    radius,
    width,
    dayColor,
    nightColor,
    dayOpacity,
    nightOpacity,
    markerRadius,
    markerColor,
    markerOpacity,
  } = SOLAR_BAND_STYLE;

  const daylightArcPath = getArcPath(sunriseMinutes, sunsetMinutes, radius);
  const nightArcPath = getArcPath(sunsetMinutes, sunriseMinutes, radius);

  const sunrisePoint = getPointOnCircle(sunriseMinutes, radius);
  const sunsetPoint = getPointOnCircle(sunsetMinutes, radius);

  return (
    <>
      <path
        d={nightArcPath}
        fill="none"
        stroke={nightColor}
        stroke-width={String(width)}
        opacity={String(nightOpacity)}
      />
      <path
        d={daylightArcPath}
        fill="none"
        stroke={dayColor}
        stroke-width={String(width)}
        opacity={String(dayOpacity)}
      />
      <circle
        cx={sunrisePoint.x}
        cy={sunrisePoint.y}
        r={String(markerRadius)}
        fill={markerColor}
        opacity={String(markerOpacity)}
      />
      <circle
        cx={sunsetPoint.x}
        cy={sunsetPoint.y}
        r={String(markerRadius)}
        fill={markerColor}
        opacity={String(markerOpacity)}
      />
    </>
  );
}
