import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ColorScheme } from "../../utils/storage";
import { isDarkScheme } from "../color-scheme";
import { type ScheduleChange } from "../../utils/config";

interface ScheduleChangesTableProps {
  changes: ScheduleChange[];
  colorScheme?: Signal<ColorScheme>;
  title?: string;
  className?: string;
}

const MONTH_NAMES = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTH_NAMES[month - 1]}`;
}

export function ScheduleChangesTable({
  changes,
  colorScheme,
  title,
  className,
}: ScheduleChangesTableProps): JSX.Element | null {
  if (changes.length === 0) return null;

  const scheme = colorScheme?.value ?? "emerald";
  const isDark = isDarkScheme(scheme);

  const rowBase = "text-[11px] leading-tight";
  const headerText = isDark ? "text-slate-300" : "text-slate-500";
  const rowText = isDark ? "text-slate-200" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-400";
  const borderClass = isDark ? "border-slate-600/40" : "border-slate-200";
  const arrowClass = isDark ? "text-slate-400" : "text-slate-400";

  return (
    <div class={twMerge("mt-4 mb-2 px-2", className)}>
      {title && (
        <p
          class={twMerge(
            "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
            headerText,
          )}
        >
          {title}
        </p>
      )}
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th
              class={twMerge(
                rowBase,
                "font-semibold uppercase tracking-wider text-left pb-1.5 pr-3",
                headerText,
              )}
            >
              Data
            </th>
            <th
              class={twMerge(
                rowBase,
                "font-semibold uppercase tracking-wider text-left pb-1.5 pr-3",
                headerText,
              )}
            >
              Cursa
            </th>
            <th
              class={twMerge(
                rowBase,
                "font-semibold uppercase tracking-wider text-left pb-1.5",
                headerText,
              )}
            >
              Modificare
            </th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change) => {
            const key = `${change.date}-${change.line}-${change.direction}-${change.oldTime}`;
            return (
              <tr key={key}>
                <td
                  class={twMerge(
                    rowBase,
                    "py-0.5 pr-3 border-t whitespace-nowrap tabular-nums",
                    borderClass,
                    rowText,
                  )}
                >
                  {formatDate(change.date)}
                </td>
                <td
                  class={twMerge(
                    rowBase,
                    "py-0.5 pr-3 border-t whitespace-nowrap",
                    borderClass,
                    rowText,
                  )}
                >
                  {change.line} {change.direction}
                  <span class={twMerge("ml-1 italic", mutedText)}>({change.program})</span>
                </td>
                <td
                  class={twMerge(
                    rowBase,
                    "py-0.5 border-t whitespace-nowrap tabular-nums",
                    borderClass,
                    rowText,
                  )}
                >
                  <span class="line-through opacity-60">{change.oldTime}</span>
                  <span class={twMerge("mx-1", arrowClass)}>→</span>
                  <span class="font-semibold">{change.newTime}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
