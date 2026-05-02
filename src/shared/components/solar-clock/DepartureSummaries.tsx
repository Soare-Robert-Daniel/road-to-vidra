import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { minutesToTimeLabel, type SolarTimesSummary } from "../../utils/solar";
import { formatTimeDifference } from "../../utils/utils";
import type { RouteLayer } from "./constants";

interface DepartureSummariesProps {
  routeLayers: RouteLayer[];
  solarTimes?: SolarTimesSummary;
}

export function DepartureSummaries({
  routeLayers,
  solarTimes,
}: DepartureSummariesProps): JSX.Element {
  return (
    <div class="flex w-full flex-col gap-2 px-1 pb-1">
      <div class="inline-flex w-full gap-2">
        {routeLayers.map((routeLayer) => {
          const [primary, ...followUps] = routeLayer.upcomingDepartures;

          return (
            <div
              key={`summary-${routeLayer.direction}`}
              class={twMerge(
                "flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden rounded-2xl border px-3 py-2 shadow-sm shadow-slate-200/70 backdrop-blur-sm",
                routeLayer.theme.summaryBorder,
                routeLayer.theme.summarySurface,
              )}
            >
              <div class="min-w-0">
                <div
                  class={twMerge(
                    "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                    routeLayer.theme.legendBg,
                    routeLayer.theme.legendText,
                  )}
                >
                  <span
                    class="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: routeLayer.theme.marker }}
                  />
                  <span>{routeLayer.label}</span>
                </div>
              </div>

              <div class="flex items-baseline gap-2">
                <div
                  class={twMerge(
                    "font-display text-xl font-black tabular-nums tracking-tight",
                    routeLayer.theme.summaryText,
                  )}
                >
                  {primary?.time ?? "--:--"}
                </div>
                <div
                  class={twMerge(
                    "font-ui text-xs font-semibold uppercase tracking-[0.16em]",
                    routeLayer.theme.summaryMuted,
                  )}
                >
                  {!primary
                    ? "fara curse"
                    : primary.minutesUntil <= 0
                      ? "acum"
                      : formatTimeDifference(primary.minutesUntil)}
                </div>
              </div>

              {followUps.length > 0 && (
                <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {followUps.map((dep) => (
                    <div key={dep.time} class="inline-flex items-baseline gap-1">
                      <span
                        class={twMerge(
                          "font-display text-sm font-bold tabular-nums tracking-tight",
                          routeLayer.theme.summaryMuted,
                        )}
                      >
                        {dep.time}
                      </span>
                      <span
                        class={twMerge(
                          "font-ui text-[10px] font-medium uppercase tracking-[0.12em]",
                          routeLayer.theme.summaryMuted,
                        )}
                      >
                        {dep.minutesUntil <= 0 ? "acum" : formatTimeDifference(dep.minutesUntil)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {solarTimes && (
        <div class="font-ui flex items-center justify-between px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
          <span>Rasarit {minutesToTimeLabel(solarTimes.sunriseMinutes)}</span>
          <span>Apus {minutesToTimeLabel(solarTimes.sunsetMinutes)}</span>
        </div>
      )}
    </div>
  );
}
