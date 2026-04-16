import { JSX } from "preact";

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <div class="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
      <div class="text-sm text-slate-600">Se incarca...</div>
    </div>
  );
}

interface ErrorOverlayProps {
  error: string | null;
}

export function ErrorOverlay({ error }: ErrorOverlayProps): JSX.Element | null {
  if (!error) return null;

  return (
    <div class="absolute top-2 left-2 right-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
      {error}
    </div>
  );
}

interface NoBusesOverlayProps {
  visible: boolean;
  busNumber: string;
}

export function NoBusesOverlay({ visible, busNumber }: NoBusesOverlayProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <div class="absolute top-2 left-2 right-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800">
      Nu exista autobuze pe ruta {busNumber} in acest moment.
    </div>
  );
}
