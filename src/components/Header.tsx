import { JSX } from "preact";

interface HeaderProps {
  holidayName: string | null;
  currentDate: Date;
}

export function Header({ holidayName, currentDate }: HeaderProps): JSX.Element {
  return (
    <header class="text-center mb-2">
      <div class="text-base text-gray-500">
        {holidayName && `${holidayName}, `}
        {currentDate.toLocaleDateString("ro-RO", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </header>
  );
}
