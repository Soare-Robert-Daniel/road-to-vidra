import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export function useCurrentTime() {
  const currentTime = signal(Date.now());
  let lastMinute = new Date().getMinutes();

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();

      // Only update the signal if the minute has changed (optimization)
      if (lastMinute !== currentMinute) {
        lastMinute = currentMinute;
        currentTime.value = now.getTime();
      }
    };

    updateCurrentTime();
    const intervalId = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return currentTime;
}
