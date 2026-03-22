import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { fetchWeatherApi } from "openmeteo";

import { vidraLocation } from "../solar";

export interface HourlyTemperature {
  hour: string;
  temperature: number;
}

export interface WeatherData {
  temperatures: HourlyTemperature[];
  fetchedAt: number;
}

const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours
const API_URL = "https://api.open-meteo.com/v1/forecast";

const weatherData = signal<WeatherData | null>(null);
const weatherError = signal<string | null>(null);
let intervalId: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

function isCacheFresh(): boolean {
  if (!weatherData.value) return false;
  return Date.now() - weatherData.value.fetchedAt < CACHE_DURATION_MS;
}

async function fetchTemperatures(): Promise<void> {
  if (isCacheFresh()) return;

  try {
    const responses = await fetchWeatherApi(API_URL, {
      latitude: vidraLocation.latitude,
      longitude: vidraLocation.longitude,
      hourly: "temperature_2m",
      forecast_hours: 24,
      timezone: "auto",
    });

    const response = responses[0];
    const hourly = response.hourly();

    if (!hourly) {
      weatherError.value = "No hourly data available";
      return;
    }

    const startTimestamp = Number(hourly.time());
    const interval = hourly.interval();
    const temps = hourly.variables(0)?.valuesArray();

    if (!temps) {
      weatherError.value = "No temperature data available";
      return;
    }

    const temperatures: HourlyTemperature[] = [];
    for (let i = 0; i < temps.length; i++) {
      const date = new Date((startTimestamp + interval * i) * 1000);
      const hour = date.toLocaleString("en-CA", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/Bucharest",
      });
      temperatures.push({
        hour: `${hour}:00`,
        temperature: Math.round(temps[i] * 10) / 10,
      });
    }

    weatherData.value = { temperatures, fetchedAt: Date.now() };
    weatherError.value = null;
  } catch (err) {
    weatherError.value = err instanceof Error ? err.message : "Weather fetch failed";
  }
}

function startFetching(): void {
  if (intervalId !== null || typeof window === "undefined") return;

  fetchTemperatures();
  intervalId = window.setInterval(fetchTemperatures, CACHE_DURATION_MS);
}

function stopFetching(): void {
  if (intervalId === null) return;

  window.clearInterval(intervalId);
  intervalId = null;
}

export function useWeatherData() {
  useEffect(() => {
    subscriberCount += 1;
    startFetching();

    return () => {
      subscriberCount -= 1;

      if (subscriberCount <= 0) {
        subscriberCount = 0;
        stopFetching();
      }
    };
  }, []);

  return { data: weatherData, error: weatherError };
}
