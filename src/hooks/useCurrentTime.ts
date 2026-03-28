import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const currentTime = signal(Date.now());
let lastMinute = new Date().getMinutes();
let timerId: ReturnType<typeof setTimeout> | null = null;
let subscriberCount = 0;

function updateCurrentTime(): void {
  const now = new Date();
  const currentMinute = now.getMinutes();

  if (lastMinute !== currentMinute) {
    lastMinute = currentMinute;
    currentTime.value = now.getTime();
  }
}

function scheduleNextTick(): void {
  const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
  timerId = window.setTimeout(() => {
    updateCurrentTime();
    timerId = window.setInterval(updateCurrentTime, 60_000);
  }, msUntilNextMinute);
}

function startTicker(): void {
  if (timerId !== null || typeof window === "undefined") {
    return;
  }

  updateCurrentTime();
  scheduleNextTick();
}

function stopTicker(): void {
  if (timerId === null) {
    return;
  }

  window.clearTimeout(timerId);
  window.clearInterval(timerId);
  timerId = null;
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
