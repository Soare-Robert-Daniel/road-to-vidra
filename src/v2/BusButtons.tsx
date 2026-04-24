import { JSX } from "preact";
import { Signal } from "@preact/signals";

interface BusButtonsProps {
  selectedBusNumber: Signal<string>;
}

const buttonBase =
  "inline-block h-[31px] px-[12px] text-[14px] text-[#0f1111] rounded-[3px] border border-[#a2a6ac] border-t-[#adb1b8] border-b-[#8d9096] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer select-none whitespace-nowrap hover:border-[#979aa1] hover:border-t-[#a2a6ac] hover:border-b-[#82858a] focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] focus:outline-none";
const buttonPressed =
  "font-bold text-[#111] bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border-[#a88734] border-t-[#9c7e31] border-b-[#846a29] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.15)]";

export function BusButtons({
  selectedBusNumber,
}: BusButtonsProps): JSX.Element {
  return (
    <div class="flex flex-col gap-1">
      <div class="text-sm font-bold">Autobuz</div>
      <div class="flex flex-wrap gap-1">
        <button
          type="button"
          class={`${buttonBase} ${selectedBusNumber.value === "420" ? buttonPressed : ""}`}
          aria-pressed={selectedBusNumber.value === "420"}
          onClick={() => {
            selectedBusNumber.value = "420";
          }}
        >
          420
        </button>
        <button
          type="button"
          class={`${buttonBase} ${selectedBusNumber.value === "438" ? buttonPressed : ""}`}
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
