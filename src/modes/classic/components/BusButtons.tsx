import { JSX } from "preact";
import { Signal } from "@preact/signals";
import { type ColorScheme } from "../../../shared/utils/storage";

interface BusButtonsProps {
  selectedBusNumber: Signal<string>;
  colorScheme: Signal<ColorScheme>;
}

const buttonBase =
  "inline-block h-[31px] px-[12px] text-[14px] text-[#0f1111] rounded-[3px] border border-[#a2a6ac] border-t-[#adb1b8] border-b-[#8d9096] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer select-none whitespace-nowrap hover:border-[#979aa1] hover:border-t-[#a2a6ac] hover:border-b-[#82858a] focus:shadow-[0_0_3px_2px_rgba(16,185,129,0.5)] focus:outline-none";

function getPressedStyles(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#e2e8f0] !to-[#cbd5e1] !border-[#94a3b8] !border-t-[#cbd5e1] !border-b-[#64748b] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#94a3b8]";
    case "slate-dark":
      return "font-bold text-white !bg-gradient-to-b !from-[#475569] !to-[#334155] !border-[#1e293b] !border-t-[#334155] !border-b-[#0f172a] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#1e293b]";
    case "midnight":
      return "font-bold text-white !bg-gradient-to-b !from-[#4338ca] !to-[#3730a3] !border-[#312e81] !border-t-[#3730a3] !border-b-[#1e1b4b] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#312e81]";
    case "forest":
      return "font-bold text-white !bg-gradient-to-b !from-[#15803d] !to-[#166534] !border-[#14532d] !border-t-[#166534] !border-b-[#052e16] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#14532d]";
    case "rust":
      return "font-bold text-white !bg-gradient-to-b !from-[#b91c1c] !to-[#991b1b] !border-[#7f1d1d] !border-t-[#991b1b] !border-b-[#450a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#7f1d1d]";
    case "ocean-deep":
      return "font-bold text-white !bg-gradient-to-b !from-[#0d9488] !to-[#0f766e] !border-[#134e4a] !border-t-[#0f766e] !border-b-[#042f2e] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#134e4a]";
    case "grape":
      return "font-bold text-white !bg-gradient-to-b !from-[#7c3aed] !to-[#6d28d9] !border-[#5b21b6] !border-t-[#6d28d9] !border-b-[#3b0764] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#5b21b6]";
    case "charcoal":
      return "font-bold text-white !bg-gradient-to-b !from-[#52525b] !to-[#3f3f46] !border-[#27272a] !border-t-[#3f3f46] !border-b-[#18181b] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.3)] focus:border-[#27272a]";
    case "eliza":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#fda4af] !to-[#fb7185] !border-[#f43f5e] !border-t-[#fb7185] !border-b-[#e11d48] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#f43f5e]";
    case "azure":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#7dd3fc] !to-[#38bdf8] !border-[#0ea5e9] !border-t-[#38bdf8] !border-b-[#0284c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#0ea5e9]";
    case "amber":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#fcd34d] !to-[#fbbf24] !border-[#f59e0b] !border-t-[#fbbf24] !border-b-[#d97706] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#f59e0b]";
    case "violet":
      return "font-bold text-white !bg-gradient-to-b !from-[#a78bfa] !to-[#8b5cf6] !border-[#7c3aed] !border-t-[#8b5cf6] !border-b-[#6d28d9] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#7c3aed]";
    case "ocean":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#5eead4] !to-[#2dd4bf] !border-[#14b8a6] !border-t-[#2dd4bf] !border-b-[#0d9488] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#14b8a6]";
    case "citrus":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#bef264] !to-[#a3e635] !border-[#84cc16] !border-t-[#a3e635] !border-b-[#65a30d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#84cc16]";
    case "sunset":
      return "font-bold text-white !bg-gradient-to-b !from-[#fdba74] !to-[#fb923c] !border-[#f97316] !border-t-[#fb923c] !border-b-[#ea580c] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#f97316]";
    case "mint":
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#86efac] !to-[#4ade80] !border-[#22c55e] !border-t-[#4ade80] !border-b-[#16a34a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#22c55e]";
    default:
      return "font-bold text-[#111] !bg-gradient-to-b !from-[#6ee7b7] !to-[#34d399] !border-[#10b981] !border-t-[#34d399] !border-b-[#059669] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)] focus:border-[#10b981]";
  }
}

function getFocusStyles(colorScheme: ColorScheme): string {
  switch (colorScheme) {
    case "white":
      return "focus:border-[#94a3b8] focus:shadow-[0_0_3px_2px_rgba(148,163,184,0.5)]";
    case "slate-dark":
      return "focus:border-[#1e293b] focus:shadow-[0_0_3px_2px_rgba(30,41,59,0.5)]";
    case "midnight":
      return "focus:border-[#312e81] focus:shadow-[0_0_3px_2px_rgba(49,46,129,0.5)]";
    case "forest":
      return "focus:border-[#14532d] focus:shadow-[0_0_3px_2px_rgba(20,83,45,0.5)]";
    case "rust":
      return "focus:border-[#7f1d1d] focus:shadow-[0_0_3px_2px_rgba(127,29,29,0.5)]";
    case "ocean-deep":
      return "focus:border-[#134e4a] focus:shadow-[0_0_3px_2px_rgba(19,78,74,0.5)]";
    case "grape":
      return "focus:border-[#5b21b6] focus:shadow-[0_0_3px_2px_rgba(91,33,182,0.5)]";
    case "charcoal":
      return "focus:border-[#27272a] focus:shadow-[0_0_3px_2px_rgba(39,39,42,0.5)]";
    case "eliza":
      return "focus:border-[#f43f5e] focus:shadow-[0_0_3px_2px_rgba(244,63,94,0.5)]";
    case "azure":
      return "focus:border-[#0ea5e9] focus:shadow-[0_0_3px_2px_rgba(14,165,233,0.5)]";
    case "amber":
      return "focus:border-[#f59e0b] focus:shadow-[0_0_3px_2px_rgba(245,158,11,0.5)]";
    case "violet":
      return "focus:border-[#7c3aed] focus:shadow-[0_0_3px_2px_rgba(124,58,237,0.5)]";
    case "ocean":
      return "focus:border-[#14b8a6] focus:shadow-[0_0_3px_2px_rgba(20,184,166,0.5)]";
    case "citrus":
      return "focus:border-[#84cc16] focus:shadow-[0_0_3px_2px_rgba(132,204,22,0.5)]";
    case "sunset":
      return "focus:border-[#f97316] focus:shadow-[0_0_3px_2px_rgba(249,115,22,0.5)]";
    case "mint":
      return "focus:border-[#22c55e] focus:shadow-[0_0_3px_2px_rgba(34,197,94,0.5)]";
    default:
      return "focus:border-[#10b981] focus:shadow-[0_0_3px_2px_rgba(16,185,129,0.5)]";
  }
}

export function BusButtons({
  selectedBusNumber,
  colorScheme,
}: BusButtonsProps): JSX.Element {
  const scheme = colorScheme.value;
  const buttonPressed = getPressedStyles(scheme);
  const focusStyles = getFocusStyles(scheme);

  return (
    <div class="flex flex-col gap-1">
      <div class="text-sm font-bold">Autobuz</div>
      <div class="flex flex-wrap gap-1">
        <button
          type="button"
          class={`${buttonBase} ${focusStyles} ${selectedBusNumber.value === "420" ? buttonPressed : ""}`}
          aria-pressed={selectedBusNumber.value === "420"}
          onClick={() => {
            selectedBusNumber.value = "420";
          }}
        >
          420
        </button>
        <button
          type="button"
          class={`${buttonBase} ${focusStyles} ${selectedBusNumber.value === "438" ? buttonPressed : ""}`}
          aria-pressed={selectedBusNumber.value === "438"}
          onClick={() => {
            selectedBusNumber.value = "438";
          }}
        >
          438
        </button>
      </div>
    </div>
  );
}
