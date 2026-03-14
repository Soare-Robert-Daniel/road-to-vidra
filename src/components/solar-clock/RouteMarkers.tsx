import { JSX } from "preact";

import {
  CENTER,
  CLOCK_COLORS,
  LABEL_STYLE,
  NEXT_GLOW_ANIMATION,
  ROUTE_MARKER_STYLE,
  getArcPath,
  getDepartureLabelPoint,
  getHeadwayOpacity,
  getPointOnCircle,
} from "./constants";
import type { Direction, RouteLayer } from "./constants";

interface RouteMarkersProps {
  routeLayers: RouteLayer[];
  directions?: Direction[];
}

/**
 * Renders all bus route departure times as markers on the clock.
 *
 * Draws for each route (tur/retur):
 * - Dashed guide circle showing the lane where departures are marked
 * - Arc segments between consecutive departures (opacity varies by headway: dense/medium/sparse)
 * - Tick marks at each departure time (thinner for past, thicker for upcoming, brightest for next departure)
 * - Time labels (minute digits) at each departure, with next departure highlighted in bold and animated pulsing glow
 */
export function RouteMarkers({
  routeLayers,
  directions,
}: RouteMarkersProps): JSX.Element {
  const layers = directions
    ? routeLayers.filter((l) => directions.includes(l.direction))
    : routeLayers;

  return (
    <>
      {layers.map((routeLayer) => (
        <circle
          key={`guide-${routeLayer.direction}`}
          cx={CENTER}
          cy={CENTER}
          r={routeLayer.geometry.laneRadius}
          fill="none"
          stroke={routeLayer.theme.markerSoft}
          stroke-width={String(ROUTE_MARKER_STYLE.guideWidth)}
          stroke-dasharray={routeLayer.geometry.guideDash}
          opacity={String(ROUTE_MARKER_STYLE.guideOpacity)}
        />
      ))}

      {layers.map((routeLayer) =>
        routeLayer.entries.slice(0, -1).map((departure, index) => {
          const nextEntry = routeLayer.entries[index + 1];
          const spanMinutes =
            nextEntry.totalMinutes - departure.totalMinutes;
          const segmentOpacity = getHeadwayOpacity(spanMinutes);

          return (
            <path
              key={`segment-${routeLayer.direction}-${departure.time}-${nextEntry.time}`}
              d={getArcPath(
                departure.totalMinutes,
                nextEntry.totalMinutes,
                routeLayer.geometry.laneRadius,
              )}
              fill="none"
              stroke={routeLayer.theme.markerSoft}
              stroke-width={String(ROUTE_MARKER_STYLE.segmentWidth)}
              stroke-linecap="round"
              opacity={
                departure.isPast && nextEntry.isPast
                  ? segmentOpacity *
                    ROUTE_MARKER_STYLE.pastSegmentMultiplier
                  : segmentOpacity
              }
            />
          );
        }),
      )}

      {layers.map((routeLayer) => (
        <g key={`route-layer-${routeLayer.direction}`}>
          {routeLayer.entries.map((departure) => {
            const isNextDeparture =
              routeLayer.nextDeparture?.time === departure.time;
            const tickInset = isNextDeparture
              ? ROUTE_MARKER_STYLE.nextTickInset
              : ROUTE_MARKER_STYLE.tickInset;
            const tickStart = getPointOnCircle(
              departure.totalMinutes,
              routeLayer.geometry.laneRadius - tickInset,
            );
            const tickEnd = getPointOnCircle(
              departure.totalMinutes,
              routeLayer.geometry.laneRadius + tickInset,
            );
            const tickOpacity =
              departure.isPast && !isNextDeparture
                ? ROUTE_MARKER_STYLE.pastTickOpacity
                : ROUTE_MARKER_STYLE.tickOpacity;
            const labelPoint = getDepartureLabelPoint(
              routeLayer,
              departure,
            );
            const labelOpacity =
              departure.isPast && !isNextDeparture
                ? LABEL_STYLE.routePastOpacity
                : LABEL_STYLE.routeBaseOpacity;
            const labelFontSize = routeLayer.geometry.labelFontSize;

            return (
              <g key={`${routeLayer.direction}-${departure.time}`}>
                {isNextDeparture && (
                  <line
                    x1={tickStart.x}
                    y1={tickStart.y}
                    x2={tickEnd.x}
                    y2={tickEnd.y}
                    stroke={routeLayer.theme.marker}
                    stroke-width={String(ROUTE_MARKER_STYLE.nextGlowWidth)}
                    stroke-linecap="round"
                    opacity={String(ROUTE_MARKER_STYLE.nextGlowOpacity)}
                  >
                    <animate
                      attributeName="opacity"
                      values={`${ROUTE_MARKER_STYLE.nextGlowOpacity};${NEXT_GLOW_ANIMATION.peakOpacity};${ROUTE_MARKER_STYLE.nextGlowOpacity}`}
                      dur={NEXT_GLOW_ANIMATION.duration}
                      begin={
                        routeLayer.direction === "retur"
                          ? NEXT_GLOW_ANIMATION.staggerDelay
                          : "0s"
                      }
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values={`${ROUTE_MARKER_STYLE.nextGlowWidth};${ROUTE_MARKER_STYLE.nextGlowWidth + NEXT_GLOW_ANIMATION.peakWidthOffset};${ROUTE_MARKER_STYLE.nextGlowWidth}`}
                      dur={NEXT_GLOW_ANIMATION.duration}
                      begin={
                        routeLayer.direction === "retur"
                          ? NEXT_GLOW_ANIMATION.staggerDelay
                          : "0s"
                      }
                      repeatCount="indefinite"
                    />
                  </line>
                )}

                <line
                  x1={tickStart.x}
                  y1={tickStart.y}
                  x2={tickEnd.x}
                  y2={tickEnd.y}
                  stroke={routeLayer.theme.marker}
                  stroke-width={
                    isNextDeparture
                      ? String(ROUTE_MARKER_STYLE.nextTickWidth)
                      : String(ROUTE_MARKER_STYLE.tickWidth)
                  }
                  stroke-linecap="round"
                  opacity={tickOpacity}
                />

                <text
                  x={labelPoint.x}
                  y={labelPoint.y + LABEL_STYLE.routeBaselineOffset}
                  paint-order="stroke fill"
                  stroke={CLOCK_COLORS.routeTextStroke}
                  stroke-width={
                    isNextDeparture
                      ? String(LABEL_STYLE.routeNextStrokeWidth)
                      : String(LABEL_STYLE.routeStrokeWidth)
                  }
                  stroke-linejoin="round"
                  fill={routeLayer.theme.marker}
                  opacity={isNextDeparture ? "1" : String(labelOpacity)}
                  font-size={String(labelFontSize)}
                  font-weight={isNextDeparture ? "800" : "700"}
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {departure.minute}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}
