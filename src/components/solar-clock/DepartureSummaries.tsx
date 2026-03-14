import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

import { getCompactNextDepartureSummary } from "./constants";
import type { RouteLayer } from "./constants";

interface DepartureSummariesProps {
  routeLayers: RouteLayer[];
}

export function DepartureSummaries({
  routeLayers,
}: DepartureSummariesProps): JSX.Element {
  return (
    <div class="flex w-full flex-col gap-2 px-1 pb-1 sm:flex-row">
      {routeLayers.map((routeLayer) => (
        <div
          key={`summary-${routeLayer.direction}`}
          class={twMerge(
            "flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-3 py-2 shadow-sm shadow-slate-200/70 backdrop-blur-sm",
            routeLayer.theme.summaryBorder,
            routeLayer.theme.summarySurface,
          )}
        >
          <div class="min-w-0">
            <div
              class={twMerge(
                "inline-flex max-w-full items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
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

          <div class="flex items-baseline gap-2 whitespace-nowrap">
            <div
              class={twMerge(
                "text-xl font-black tabular-nums tracking-tight",
                routeLayer.theme.summaryText,
              )}
            >
              {routeLayer.nextDeparture?.time ?? "--:--"}
            </div>
            <div
              class={twMerge(
                "text-xs font-semibold uppercase tracking-[0.16em]",
                routeLayer.theme.summaryMuted,
              )}
            >
              {getCompactNextDepartureSummary(routeLayer.nextDeparture)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
