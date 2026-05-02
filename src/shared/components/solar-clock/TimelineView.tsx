import { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { MINUTES_PER_DAY, type SolarTimesSummary } from "../../utils/solar";
import { formatTimeDifference, timeToMinutes } from "../../utils/utils";
import { POSTER_SECTION_DEFS, type RouteLayer, type RouteEntry } from "./constants";

interface TimelineViewProps {
  routeLayers: RouteLayer[];
  solarTimes: SolarTimesSummary;
}

const selectedTurHour = signal<string | null>(null);
const selectedReturHour = signal<string | null>(null);

const MINUTE_HEIGHT = 2;
const TIMELINE_PADDING = 30;
const COLLAPSED_WINDOW = 90;

// --- Helpers ---

function timeToY(totalMinutes: number, startMinutes: number): number {
  return (totalMinutes - startMinutes) * MINUTE_HEIGHT;
}

function getMinutesUntilHour(timeStr: string, currentMinutes: number): number {
  const diff = timeToMinutes(timeStr) - currentMinutes;
  return diff > 0 ? diff : diff + MINUTES_PER_DAY;
}

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "acum";
  return formatTimeDifference(minutes);
}

// --- Overlap resolution ---

interface PositionedDeparture {
  entry: RouteEntry;
  direction: "tur" | "retur";
  side: "left" | "right";
}

function computePositions(
  returEntries: RouteEntry[],
  turEntries: RouteEntry[],
): PositionedDeparture[] {
  const all: PositionedDeparture[] = [
    ...returEntries.map((e) => ({
      entry: e,
      direction: "retur" as const,
      side: "left" as const,
    })),
    ...turEntries.map((e) => ({
      entry: e,
      direction: "tur" as const,
      side: "right" as const,
    })),
  ].sort((a, b) => a.entry.totalMinutes - b.entry.totalMinutes);

  const GAP = 18;
  let lastRight = -Infinity;
  let lastLeft = -Infinity;

  for (const dep of all) {
    if (dep.side === "right") {
      if (dep.entry.totalMinutes - lastRight < GAP) {
        dep.side = "left";
        lastLeft = dep.entry.totalMinutes;
      } else {
        lastRight = dep.entry.totalMinutes;
      }
    } else if (dep.entry.totalMinutes - lastLeft < GAP) {
      dep.side = "right";
      lastRight = dep.entry.totalMinutes;
    } else {
      lastLeft = dep.entry.totalMinutes;
    }
  }

  return all;
}

// --- Component ---

export function TimelineView({ routeLayers, solarTimes }: TimelineViewProps): JSX.Element {
  const returLayer = routeLayers.find((l) => l.direction === "retur")!;
  const turLayer = routeLayers.find((l) => l.direction === "tur")!;
  const currentMinutes = solarTimes.currentMinutes;
  const [showPastHours, setShowPastHours] = useState(true);

  const handleSelect = (direction: "tur" | "retur", time: string) => {
    const sig = direction === "tur" ? selectedTurHour : selectedReturHour;
    sig.value = sig.value === time ? null : time;
  };

  const positioned = useMemo(
    () => computePositions(returLayer.entries, turLayer.entries),
    [returLayer.entries, turLayer.entries],
  );

  const { startMinutes, endMinutes } = useMemo(() => {
    const allMinutes = [...returLayer.entries, ...turLayer.entries].map((e) => e.totalMinutes);
    if (allMinutes.length === 0) return { startMinutes: 360, endMinutes: 1200 };
    const min = Math.min(...allMinutes);
    const max = Math.max(...allMinutes);
    return {
      startMinutes: Math.max(0, min - TIMELINE_PADDING),
      endMinutes: Math.min(MINUTES_PER_DAY, max + TIMELINE_PADDING),
    };
  }, [returLayer.entries, turLayer.entries]);

  const hourMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let h = 0; h <= 24; h++) {
      const m = h * 60;
      if (m >= startMinutes && m <= endMinutes) markers.push(h);
    }
    return markers;
  }, [startMinutes, endMinutes]);

  const sectionLabels = useMemo(
    () =>
      POSTER_SECTION_DEFS.filter((s) => {
        if (s.id === "noapte") return false;
        const mid = (s.startMinutes + s.endMinutes) / 2;
        return mid >= startMinutes && mid <= endMinutes;
      }),
    [startMinutes, endMinutes],
  );

  const leftNodes = useMemo(() => positioned.filter((d) => d.side === "left"), [positioned]);
  const rightNodes = useMemo(() => positioned.filter((d) => d.side === "right"), [positioned]);

  const nextTurTime = turLayer.nextDeparture?.time ?? null;
  const nextReturTime = returLayer.nextDeparture?.time ?? null;

  const selectedTur = selectedTurHour.value;
  const selectedRetur = selectedReturHour.value;

  const visibleStartMinutes = useMemo(() => {
    if (showPastHours) return startMinutes;
    if (endMinutes - startMinutes <= COLLAPSED_WINDOW) return startMinutes;

    const targetStart = currentMinutes - TIMELINE_PADDING;
    const maxStart = endMinutes - COLLAPSED_WINDOW;

    return Math.max(startMinutes, Math.min(targetStart, maxStart));
  }, [currentMinutes, endMinutes, showPastHours, startMinutes]);

  const visibleLeftNodes = useMemo(
    () =>
      showPastHours
        ? leftNodes
        : leftNodes.filter(({ entry }) => entry.totalMinutes >= visibleStartMinutes),
    [leftNodes, showPastHours, visibleStartMinutes],
  );

  const visibleRightNodes = useMemo(
    () =>
      showPastHours
        ? rightNodes
        : rightNodes.filter(({ entry }) => entry.totalMinutes >= visibleStartMinutes),
    [rightNodes, showPastHours, visibleStartMinutes],
  );

  const visibleHourMarkers = useMemo(
    () => hourMarkers.filter((hour) => hour * 60 >= visibleStartMinutes),
    [hourMarkers, visibleStartMinutes],
  );

  const visibleSectionLabels = useMemo(
    () => sectionLabels.filter((section) => section.endMinutes >= visibleStartMinutes),
    [sectionLabels, visibleStartMinutes],
  );

  const nowY = timeToY(currentMinutes, visibleStartMinutes);
  const totalHeight = (endMinutes - visibleStartMinutes) * MINUTE_HEIGHT;

  return (
    <div class="relative w-full">
      <div class="mb-2 flex w-full justify-end px-1">
        <button
          type="button"
          class={twMerge(
            "font-ui inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm shadow-slate-200/70 transition-all duration-200",
            "hover:border-slate-300 hover:text-slate-800 hover:shadow-md",
          )}
          onClick={() => setShowPastHours((value) => !value)}
        >
          <span class="text-[10px] leading-none">{showPastHours ? "\u25bc" : "\u25b2"}</span>
          <span>{showPastHours ? "Ascunde orele trecute" : "Arata orele trecute"}</span>
        </button>
      </div>

      <div class="grid w-full grid-cols-[1fr_minmax(0,auto)_1fr]" style={{ height: totalHeight }}>
        {/* Left column — retur */}
        <div class="relative">
          {visibleLeftNodes.map(({ entry, direction }) => {
            const color = returLayer.theme.marker;
            const isPast = entry.isPast;
            const isNext = entry.time === nextReturTime;
            const isSelected = selectedRetur === entry.time;
            const countdown =
              isSelected || isNext
                ? formatCountdown(getMinutesUntilHour(entry.time, currentMinutes))
                : null;

            return (
              <div
                key={`${direction}-${entry.index}`}
                class="absolute right-0 z-10 -translate-y-1/2"
                style={{
                  top: `${timeToY(entry.totalMinutes, visibleStartMinutes)}px`,
                }}
              >
                <button
                  type="button"
                  class={twMerge(
                    "flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 transition-all duration-200",
                    "hover:scale-[1.03] hover:bg-slate-50",
                    isSelected && "ring-1 ring-slate-300 bg-white shadow-sm",
                    isPast && "opacity-30",
                  )}
                  onClick={() => handleSelect(direction, entry.time)}
                >
                  {isNext && (
                    <span class="rounded bg-slate-800 px-1 py-[1px] text-[8px] font-bold leading-none text-white">
                      NEXT
                    </span>
                  )}
                  <span
                    class={twMerge(
                      "font-display font-bold tabular-nums",
                      isNext ? "text-base" : "text-sm",
                    )}
                    style={{ color: isPast ? "#94a3b8" : color }}
                  >
                    {entry.time}
                  </span>
                  <span
                    class={twMerge("shrink-0 rounded-full", isNext ? "h-3.5 w-3.5" : "h-3 w-3")}
                    style={{
                      backgroundColor: isPast ? "#94a3b8" : color,
                      boxShadow: isNext && !isPast ? `0 0 0 3px ${color}25` : undefined,
                    }}
                  />
                  <span
                    class="text-[10px] font-semibold"
                    style={{ color: isPast ? "#94a3b8" : color, opacity: 0.4 }}
                  >
                    {"\u2190"}
                  </span>
                  {countdown && (
                    <span
                      class="rounded bg-white px-1 py-0.5 text-[10px] font-bold shadow-sm ring-1"
                      style={{ color, ringColor: color }}
                    >
                      {countdown}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Center — timeline */}
        <div class="relative">
          <div
            class="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-slate-300"
            style={{ height: nowY }}
          />
          <div
            class="absolute left-1/2 w-[2px] -translate-x-1/2 bg-slate-200"
            style={{ top: nowY, height: totalHeight - nowY }}
          />

          {visibleHourMarkers.map((hour) => (
            <div
              key={hour}
              class="absolute z-[5] -translate-y-1/2"
              style={{ top: `${timeToY(hour * 60, visibleStartMinutes)}px` }}
            >
              <div class="h-px w-3 bg-slate-300" />
            </div>
          ))}

          {visibleSectionLabels.map((section) => (
            <span
              key={section.id}
              class="pointer-events-none absolute z-[3] -translate-x-1/2 whitespace-nowrap text-[8px] font-semibold uppercase tracking-widest"
              style={{
                top: `${timeToY((section.startMinutes + section.endMinutes) / 2, visibleStartMinutes)}px`,
                color: section.titleColor,
                opacity: 0.35,
              }}
            >
              {section.label}
            </span>
          ))}

          {currentMinutes >= 0 && currentMinutes <= MINUTES_PER_DAY && (
            <div
              class="pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2"
              style={{ top: `${nowY}px` }}
            >
              <div class="h-[3px] bg-slate-400 shadow-[0_0_4px_rgba(100,116,139,0.3)]" />
              <div
                class="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800"
                style={{
                  left: "50%",
                  animation: "now-pulse 2s ease-in-out infinite",
                }}
              />
            </div>
          )}
        </div>

        {/* Right column — tur */}
        <div class="relative">
          {visibleRightNodes.map(({ entry, direction }) => {
            const color = turLayer.theme.marker;
            const isPast = entry.isPast;
            const isNext = entry.time === nextTurTime;
            const isSelected = selectedTur === entry.time;
            const countdown =
              isSelected || isNext
                ? formatCountdown(getMinutesUntilHour(entry.time, currentMinutes))
                : null;

            return (
              <div
                key={`${direction}-${entry.index}`}
                class="absolute left-0 z-10 -translate-y-1/2"
                style={{
                  top: `${timeToY(entry.totalMinutes, visibleStartMinutes)}px`,
                }}
              >
                <button
                  type="button"
                  class={twMerge(
                    "flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 transition-all duration-200",
                    "hover:scale-[1.03] hover:bg-slate-50",
                    isSelected && "ring-1 ring-slate-300 bg-white shadow-sm",
                    isPast && "opacity-30",
                  )}
                  onClick={() => handleSelect(direction, entry.time)}
                >
                  <span
                    class="text-[10px] font-semibold"
                    style={{ color: isPast ? "#94a3b8" : color, opacity: 0.4 }}
                  >
                    {"\u2192"}
                  </span>
                  <span
                    class={twMerge(
                      "font-display font-bold tabular-nums",
                      isNext ? "text-base" : "text-sm",
                    )}
                    style={{ color: isPast ? "#94a3b8" : color }}
                  >
                    {entry.time}
                  </span>
                  <span
                    class={twMerge("shrink-0 rounded-full", isNext ? "h-3.5 w-3.5" : "h-3 w-3")}
                    style={{
                      backgroundColor: isPast ? "#94a3b8" : color,
                      boxShadow: isNext && !isPast ? `0 0 0 3px ${color}25` : undefined,
                    }}
                  />
                  {isNext && (
                    <span class="rounded bg-slate-800 px-1 py-[1px] text-[8px] font-bold leading-none text-white">
                      NEXT
                    </span>
                  )}
                  {countdown && (
                    <span
                      class="rounded bg-white px-1 py-0.5 text-[10px] font-bold shadow-sm ring-1"
                      style={{ color, ringColor: color }}
                    >
                      {countdown}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
