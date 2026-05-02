import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { twMerge } from "tailwind-merge";

import { type ColorScheme } from "../../utils/storage";
import { isDarkScheme } from "../color-scheme";
import { romanianNationalHolidays, nonFixedHolidays } from "../../utils/config";

interface HolidayTableProps {
  colorScheme?: Signal<ColorScheme>;
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
  const [month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTH_NAMES[month - 1]}`;
}

export function HolidayTable({ colorScheme }: HolidayTableProps): JSX.Element {
  const scheme = colorScheme?.value ?? "emerald";
  const isDark = isDarkScheme(scheme);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("en-CA", {
    month: "2-digit",
    timeZone: "Europe/Bucharest",
  });
  const currentDay = currentDate.toLocaleString("en-CA", {
    day: "2-digit",
    timeZone: "Europe/Bucharest",
  });
  const todayStr = `${currentMonth}-${currentDay}`;

  const allHolidays = [
    ...romanianNationalHolidays.map((h) => ({ ...h, fixed: true })),
    ...nonFixedHolidays.map((h) => ({ ...h, fixed: false })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const rowBase = "text-[11px] leading-tight";
  const headerText = isDark ? "text-slate-300" : "text-slate-500";
  const rowText = isDark ? "text-slate-200" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-400";
  const borderClass = isDark ? "border-slate-600/40" : "border-slate-200";
  const highlightBg = isDark ? "bg-amber-900/30" : "bg-amber-50";
  const highlightText = isDark ? "text-amber-300" : "text-amber-700";

  return (
    <div class="mt-4 mb-2 px-2">
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
                "font-semibold uppercase tracking-wider text-left pb-1.5",
                headerText,
              )}
            >
              Sărbătoare
            </th>
          </tr>
        </thead>
        <tbody>
          {allHolidays.map((holiday) => {
            const isToday = holiday.date === todayStr;
            return (
              <tr key={holiday.date + holiday.name} class={twMerge(isToday && highlightBg)}>
                <td
                  class={twMerge(
                    rowBase,
                    "py-0.5 pr-3 border-t whitespace-nowrap tabular-nums",
                    borderClass,
                    isToday ? twMerge("font-semibold", highlightText) : rowText,
                  )}
                >
                  {formatDate(holiday.date)}
                </td>
                <td
                  class={twMerge(
                    rowBase,
                    "py-0.5 border-t",
                    borderClass,
                    isToday ? twMerge("font-semibold", highlightText) : rowText,
                  )}
                >
                  {holiday.name}
                  {!holiday.fixed && <span class={twMerge("ml-1 italic", mutedText)}>*</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p class={twMerge("text-[10px] mt-1 italic", mutedText)}>
        * Sărbători cu dată variabilă (valabile pentru 2026). În aceste zile se circulă conform programului de weekend.
      </p>
    </div>
  );
}
