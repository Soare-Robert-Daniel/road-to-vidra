import { JSX } from "preact";

interface HolidayBannerProps {
  holidayName: string | null;
}

export function HolidayBanner({
  holidayName,
}: HolidayBannerProps): JSX.Element | null {
  if (!holidayName) return null;

  return (
    <div class="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-2 mb-2 rounded-r-lg text-center">
      <p class="text-sm font-bold">
        Atenție: Sărbătoare legală ({holidayName})
      </p>
      <p class="text-xs">Astăzi se circulă conform programului de weekend.</p>
    </div>
  );
}
