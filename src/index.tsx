/*
	Application description:

	PURPOSE
	Display the route hours for bus number 420 and 438 in a friendly and eficient matter for the human eye.

	FUNCTIONALITY
	Display the bus hours for each route based on the selected bus.
	Should detect if the weekend or holyday program is active or not.
	Should allow the user to switch between workday and holyday (non persistent options). The default should be based on the type of the day.

	TECH STACK
	Preact, Tailwind

*/

import { render } from "preact";
import { signal } from "@preact/signals";

import "./style.css";
import { busScheduleData } from "./config";
import {
  isWeekendProgram,
  getHolidayName,
  timeToMinutes,
  formatTimeDifference,
  timeUntilTomorrow,
} from "./utils";

// State management
const selectedBusNumber = signal("420");
// 'auto': determined by day, 'lucru': forced workday, 'weekend': forced weekend
const programMode = signal<"auto" | "lucru" | "weekend">("auto");
const showNextDayProgram = signal(false);

export function App() {
  const currentDate = new Date();
  const isCurrentlyWeekendProgram = isWeekendProgram(currentDate);
  const holidayName = getHolidayName(currentDate);

  // By reading the signals here, we ensure this component re-renders on change.
  const busNumber = selectedBusNumber.value;
  const mode = programMode.value;
  const showNextDay = showNextDayProgram.value;

  let useWeekendSchedule;
  if (mode === "auto") {
    useWeekendSchedule = isCurrentlyWeekendProgram;
  } else {
    useWeekendSchedule = mode === "weekend";
  }

  return (
    <div class="min-h-screen bg-gray-50 p-1">
      <div class="max-w-6xl mx-auto">
        {/* Holiday Banner */}
        {holidayName && (
          <div class="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-2 mb-2 rounded-r-lg text-center">
            <p class="text-sm font-bold">
              Atenție: Sărbătoare legală ({holidayName})
            </p>
            <p class="text-xs">
              Astăzi se circulă conform programului de weekend.
            </p>
          </div>
        )}

        {/* Ultra-Compact Mobile Header */}
        <header class="text-center mb-2">
          <div class="text-base text-gray-500">
            {holidayName && `${holidayName}, `}
            {currentDate.toLocaleDateString("ro-RO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Settings Menu */}
        <SettingsMenu
          isWeekendProgram={isCurrentlyWeekendProgram}
          holidayName={holidayName}
        />

        {/* Bus Hours Display */}
        <div class="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
          <DisplayStationHours
            busNumber={busNumber}
            direction="tur"
            useWeekendSchedule={useWeekendSchedule}
            showNextDay={showNextDay}
          />
          <DisplayStationHours
            busNumber={busNumber}
            direction="retur"
            useWeekendSchedule={useWeekendSchedule}
            showNextDay={showNextDay}
          />
        </div>
      </div>
    </div>
  );
}

function SettingsMenu({ isWeekendProgram, holidayName }) {
  // By reading the signals here, we ensure this component re-renders on change.
  const mode = programMode.value;
  const showNextDay = showNextDayProgram.value;

  let currentScheduleType;
  if (mode === "auto") {
    currentScheduleType = isWeekendProgram ? "weekend" : "lucru";
  } else {
    currentScheduleType = mode;
  }

  return (
    <div class="bg-white rounded-lg shadow-sm p-2 mb-2">
      <div class="flex flex-col gap-2">
        {/* First row: Bus selection and schedule type */}
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1">
            <span class="font-medium text-gray-700 text-base">Bus:</span>
            <select
              class="border border-gray-300 rounded px-2 py-1 text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedBusNumber.value}
              onChange={(e) =>
                (selectedBusNumber.value = (
                  e.target as HTMLSelectElement
                ).value)
              }
            >
              <option value="420">420</option>
              <option value="438">438</option>
            </select>
          </div>

          <div class="flex items-center gap-1">
            <button
              class={`px-2 py-1 text-base rounded transition-colors ${
                currentScheduleType === "lucru"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => (programMode.value = "lucru")}
            >
              Lucru
            </button>
            <button
              class={`px-2 py-1 text-base rounded transition-colors ${
                currentScheduleType === "weekend"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => (programMode.value = "weekend")}
            >
              Weekend
            </button>
          </div>
        </div>

        {/* Second row: Next day toggle and Auto button */}
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-base text-gray-700">
            <input
              type="checkbox"
              checked={showNextDay}
              onChange={(e) =>
                (showNextDayProgram.value = (
                  e.target as HTMLInputElement
                ).checked)
              }
              class="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Arată program mâine</span>
          </label>

          <button
            class={`px-2 py-1 text-xs rounded transition-colors ${
              mode === "auto"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => (programMode.value = "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    </div>
  );
}

function DisplayStationHours({
  busNumber,
  direction,
  useWeekendSchedule,
  showNextDay,
}) {
  const busData = busScheduleData.bus[busNumber]?.[direction];

  if (!busData) {
    return (
      <div class="bg-white rounded-lg shadow-sm p-2">
        <h3 class="text-base font-semibold text-gray-800 mb-1">
          Nu există date pentru autobuzul {busNumber}
        </h3>
      </div>
    );
  }

  const hours = useWeekendSchedule
    ? busData.weekendHours
    : busData.workingHours;
  const stationName =
    busData.station || (direction === "tur" ? "Vidra" : "Eroi Revoluției");

  const accentClass =
    busNumber === "420"
      ? direction === "tur"
        ? "bg-blue-50 border-l-4 border-blue-400"
        : "bg-green-50 border-l-4 border-green-400"
      : direction === "tur"
      ? "bg-red-50 border-l-4 border-red-400"
      : "bg-purple-50 border-l-4 border-purple-400";

  return (
    <div class={`bg-white rounded-lg shadow-sm p-2 ${accentClass}`}>
      <DisplayStationName
        label={`${stationName} (${direction.toUpperCase()})`}
        busNumber={busNumber}
      />
      <div class="mt-1">
        <DisplayHours
          hours={hours}
          showNextDay={showNextDay}
          useWeekendSchedule={useWeekendSchedule}
          busNumber={busNumber}
          direction={direction}
        />
      </div>
    </div>
  );
}

function DisplayHours({
  hours,
  showNextDay,
  useWeekendSchedule,
  busNumber,
  direction,
}) {
  if (!hours || hours.length === 0) {
    return (
      <div class="text-gray-500 text-center py-1 text-xs">
        Nu există ore disponibile
      </div>
    );
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find next bus for today's full list
  const nextBusIndexForToday = hours.findIndex((timeStr) => {
    const busTime = timeToMinutes(timeStr);
    return busTime > currentTime;
  });

  let finalHours = hours.map((h) => ({ hour: h, isToday: true }));
  let nextBusIndex = nextBusIndexForToday;

  if (showNextDay) {
    // Filter out today's past hours
    const remainingToday =
      nextBusIndexForToday === -1 ? [] : hours.slice(nextBusIndexForToday);

    // Get tomorrow's hours
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const isTomorrowWeekend = isWeekendProgram(tomorrowDate);

    // Use the correct direction for tomorrow's schedule
    const busData = busScheduleData.bus[busNumber]?.[direction];
    const tomorrowHours = busData
      ? isTomorrowWeekend
        ? busData.weekendHours
        : busData.workingHours
      : [];

    // Combine remaining of today with all of tomorrow
    finalHours = [
      ...remainingToday.map((h) => ({ hour: h, isToday: true })),
      ...tomorrowHours.map((h) => ({ hour: h, isToday: false })),
    ];

    // The next bus is always the first in this combined list
    nextBusIndex = finalHours.length > 0 ? 0 : -1;
  }

  if (finalHours.length === 0) {
    return (
      <div class="text-gray-500 text-center py-1 text-xs">
        Nu există ore disponibile pentru perioada selectată.
      </div>
    );
  }

  return (
    <div class="grid grid-cols-5 gap-0.5 mb-2">
      {finalHours.map((busInfo, index) => (
        <DisplayHour
          key={`${busInfo.hour}-${busInfo.isToday}`}
          hour={busInfo.hour}
          isNext={index === nextBusIndex}
          currentTime={currentTime}
          isToday={busInfo.isToday}
          busNumber={busNumber}
          direction={direction}
        />
      ))}
    </div>
  );
}
function DisplayStationName({ label, busNumber }) {
  return (
    <div class="border-b border-gray-200 pb-1 mb-1">
      <h3 class="text-sm font-semibold text-gray-800">
        {busNumber} - {label}
      </h3>
    </div>
  );
}

function DisplayHour({
  hour,
  isNext,
  currentTime,
  isToday = true,
  busNumber,
  direction,
}) {
  const busTime = timeToMinutes(hour);
  let timeDiff;

  if (isToday) {
    timeDiff = busTime - currentTime;
  } else {
    // Tomorrow's bus - calculate time until tomorrow + bus time
    timeDiff = timeUntilTomorrow(hour);
  }

  let remainingTime = "";
  // Show remaining time for ALL future buses, not just the next one
  if (timeDiff > 0) {
    remainingTime = formatTimeDifference(timeDiff);
  }

  const isPassed = isToday && busTime < currentTime;
  const isTomorrow = !isToday;

  let accentClasses = {
    bg: "bg-gray-50",
    text: "text-gray-800",
    nextBg: "bg-yellow-100",
    nextBorder: "border-yellow-500",
    nextText: "text-yellow-800",
    remainingText: "text-gray-600",
    nextRemainingText: "text-yellow-600",
  };

  if (busNumber === "420") {
    if (direction === "tur") {
      // Blue
      accentClasses = {
        bg: "bg-blue-50",
        text: "text-blue-800",
        nextBg: "bg-blue-100",
        nextBorder: "border-blue-500",
        nextText: "text-blue-800",
        remainingText: "text-blue-600",
        nextRemainingText: "text-blue-600",
      };
    } else {
      // Green
      accentClasses = {
        bg: "bg-green-50",
        text: "text-green-800",
        nextBg: "bg-green-100",
        nextBorder: "border-green-500",
        nextText: "text-green-800",
        remainingText: "text-green-600",
        nextRemainingText: "text-green-600",
      };
    }
  } else {
    // 438
    if (direction === "tur") {
      // Red
      accentClasses = {
        bg: "bg-red-50",
        text: "text-red-800",
        nextBg: "bg-red-100",
        nextBorder: "border-red-500",
        nextText: "text-red-800",
        remainingText: "text-red-600",
        nextRemainingText: "text-red-600",
      };
    } else {
      // Purple
      accentClasses = {
        bg: "bg-purple-50",
        text: "text-purple-800",
        nextBg: "bg-purple-100",
        nextBorder: "border-purple-500",
        nextText: "text-purple-800",
        remainingText: "text-purple-600",
        nextRemainingText: "text-purple-600",
      };
    }
  }

  return (
    <div
      class={`
      px-0.5 py-0 rounded text-center transition-all min-h-[3rem] flex flex-col justify-center
      ${
        isNext
          ? `${accentClasses.nextBg} border ${accentClasses.nextBorder} ${accentClasses.nextText} font-semibold`
          : isPassed
          ? "bg-gray-100 text-gray-500"
          : isTomorrow
          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
          : `${accentClasses.bg} ${accentClasses.text}`
      }
    `}
    >
      <div class="tabular-nums leading-tight text-xl font-medium">{hour}</div>
      {remainingTime && (
        <div
          class={`text-xs font-medium leading-none ${
            isNext
              ? accentClasses.nextRemainingText
              : isTomorrow
              ? "text-indigo-600"
              : accentClasses.remainingText
          }`}
        >
          {remainingTime}
        </div>
      )}
    </div>
  );
}

render(<App />, document.getElementById("app"));
