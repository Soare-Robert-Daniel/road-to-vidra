import { signal, type Signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const currentTime = signal(Date.now());
let lastMinute = new Date().getMinutes();
let intervalId: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

function updateCurrentTime(): void {
  const now = new Date();
  const currentMinute = now.getMinutes();

  if (lastMinute !== currentMinute) {
    lastMinute = currentMinute;
    currentTime.value = now.getTime();
  }
}

function startTicker(): void {
  if (intervalId !== null || typeof window === "undefined") {
    return;
  }

  updateCurrentTime();
  intervalId = window.setInterval(updateCurrentTime, 1000);
}

function stopTicker(): void {
  if (intervalId === null) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = null;
}

export function useCurrentTime() {
  useEffect(() => {
    subscriberCount += 1;
    startTicker();

    return () => {
      subscriberCount -= 1;

      if (subscriberCount <= 0) {
        subscriberCount = 0;
        stopTicker();
      }
    };
  }, []);

  return currentTime;
}
