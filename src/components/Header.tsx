import { JSX } from "preact";
import { twMerge } from "tailwind-merge";

interface HeaderProps {
  holidayName: string | null;
  currentDate: Date;
  className?: string;
}

export function Header({
  holidayName,
  currentDate,
  className,
}: HeaderProps): JSX.Element {
  return (
    <header class={twMerge("text-center mb-2", className)}>
      <div class={twMerge("text-base text-gray-500")}>
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
