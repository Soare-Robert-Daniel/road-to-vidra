import { JSX } from "preact";
import { Signal } from "@preact/signals";

import { type DesignVersion } from "../../storage";

interface DesignToggleFooterProps {
  designVersion: Signal<DesignVersion>;
}

export function DesignToggleFooter({ designVersion }: DesignToggleFooterProps): JSX.Element {
  const isV2 = designVersion.value === "v2";

  return (
    <footer class="mt-4 flex justify-center">
      <button
        type="button"
        class="text-xs underline"
        onClick={() => {
          designVersion.value = isV2 ? "v1" : "v2";
        }}
      >
        Design {isV2 ? "v1" : "v2"}
      </button>
    </footer>
  );
}
