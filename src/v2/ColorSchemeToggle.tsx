import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { type ColorScheme } from "../storage";

interface ColorSchemeToggleProps {
  colorScheme: Signal<ColorScheme>;
}

export function ColorSchemeToggle({ colorScheme }: ColorSchemeToggleProps): JSX.Element {
  const scheme = colorScheme.value;

  const schemes = [
    { id: "emerald", label: "Emerald", activeColor: "bg-emerald-500 border-emerald-600" },
    { id: "eliza", label: "Eliza", activeColor: "bg-rose-500 border-rose-600" },
    { id: "azure", label: "Azure", activeColor: "bg-sky-500 border-sky-600" },
    { id: "amber", label: "Amber", activeColor: "bg-amber-500 border-amber-600" },
    { id: "violet", label: "Violet", activeColor: "bg-violet-500 border-violet-600" },
    { id: "ocean", label: "Ocean", activeColor: "bg-teal-500 border-teal-600" },
    { id: "citrus", label: "Citrus", activeColor: "bg-lime-500 border-lime-600" },
    { id: "sunset", label: "Sunset", activeColor: "bg-orange-500 border-orange-600" },
    { id: "mint", label: "Mint", activeColor: "bg-green-400 border-green-500" },
  ] as const;

  return (
    <div class="mt-4">
      <div class="text-sm font-bold text-center mb-2">Schemă de Culoare</div>
      <div class="flex justify-center gap-2 flex-wrap">
        {schemes.map(({ id, label, activeColor }) => (
          <button
            key={id}
            type="button"
            class={`px-3 py-1 text-sm rounded border ${
              scheme === id
                ? `${activeColor} text-white font-bold`
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
            }`}
            onClick={() => {
              colorScheme.value = id;
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
