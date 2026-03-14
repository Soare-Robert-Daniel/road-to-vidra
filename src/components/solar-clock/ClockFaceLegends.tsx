import { JSX } from "preact";

import { LEGEND_STYLE, getArcPath } from "./constants";
import type { RouteLayer } from "./constants";

export function ClockFaceLegends({
  routeLayers,
}: {
  routeLayers: RouteLayer[];
}): JSX.Element {
  return (
    <>
      {routeLayers.map((layer) => {
        const destination = layer.label.split(" · ")[1] ?? "";
        const labelText = `Spre ${destination}`;
        const arcId = `legend-arc-${layer.direction}`;
        const radius = layer.geometry.labelRadius;

        return (
          <g key={arcId}>
            <defs>
              <path
                id={arcId}
                d={getArcPath(
                  LEGEND_STYLE.arcStartMinutes,
                  LEGEND_STYLE.arcEndMinutes,
                  radius,
                )}
                fill="none"
              />
            </defs>
            <text
              fill={layer.theme.marker}
              font-family="'IBM Plex Sans Condensed', sans-serif"
              font-size={String(LEGEND_STYLE.fontSize)}
              font-weight={String(LEGEND_STYLE.fontWeight)}
              letter-spacing={String(LEGEND_STYLE.letterSpacing)}
              opacity={String(LEGEND_STYLE.opacity)}
            >
              <textPath
                href={`#${arcId}`}
                startOffset="50%"
                text-anchor="middle"
              >
                {labelText}
              </textPath>
            </text>
          </g>
        );
      })}
    </>
  );
}
