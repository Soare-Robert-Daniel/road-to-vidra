import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

interface HolidayBannerProps {
  holidayName: string | null;
  className?: string;
}

export function HolidayBanner({
  holidayName,
  className,
}: HolidayBannerProps): JSX.Element | null {
  if (!holidayName) return null;

  return (
    <div
      class={twMerge(
        "bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-2 mb-2 rounded-r-lg text-center",
        className
      )}
    >
      <p class={twMerge("text-sm font-bold")}>
        Atenție: Sărbătoare legală ({holidayName})
      </p>
      <p class={twMerge("text-xs")}>
        Astăzi se circulă conform programului de weekend.
      </p>
    </div>
  );
}
