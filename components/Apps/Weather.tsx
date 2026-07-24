"use client";

import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets } from "lucide-react";

const HOURLY = [
  { time: "Now", temp: 22, Icon: Sun },
  { time: "1PM", temp: 23, Icon: Sun },
  { time: "2PM", temp: 24, Icon: CloudSun },
  { time: "3PM", temp: 23, Icon: CloudSun },
  { time: "4PM", temp: 21, Icon: Cloud },
  { time: "5PM", temp: 19, Icon: CloudRain },
];

const WEEKLY = [
  { day: "Today", high: 24, low: 17, Icon: Sun },
  { day: "Tue", high: 25, low: 18, Icon: Sun },
  { day: "Wed", high: 22, low: 16, Icon: CloudSun },
  { day: "Thu", high: 19, low: 14, Icon: CloudRain },
  { day: "Fri", high: 21, low: 15, Icon: Cloud },
];

export function Weather() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 no-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Bengaluru</p>
          <p className="text-5xl font-light tracking-tight">22°</p>
          <p className="text-sm text-white/50">Clear · H:24° L:17°</p>
        </div>
        <Sun size={56} className="text-accent-amber drop-shadow-[0_0_20px_rgba(255,214,10,0.5)]" />
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Hourly forecast</p>
        <div className="flex justify-between">
          {HOURLY.map(({ time, temp, Icon }) => (
            <div key={time} className="flex flex-col items-center gap-2 text-xs text-white/60">
              <span>{time}</span>
              <Icon size={18} className="text-white/80" />
              <span className="font-medium text-white">{temp}°</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-white/40">7-day forecast</p>
        <div className="space-y-2.5">
          {WEEKLY.map(({ day, high, low, Icon }) => (
            <div key={day} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-white/70">{day}</span>
              <Icon size={16} className="text-white/70" />
              <div className="flex flex-1 items-center gap-2">
                <span className="w-6 text-right text-white/40 text-xs">{low}°</span>
                <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-accent-blue/40 to-accent-amber/60" />
                <span className="w-6 text-xs">{high}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <Wind size={16} className="mb-2 text-white/50" />
          <p className="text-xs text-white/40">Wind</p>
          <p className="text-lg font-medium">8 km/h</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <Droplets size={16} className="mb-2 text-white/50" />
          <p className="text-xs text-white/40">Humidity</p>
          <p className="text-lg font-medium">54%</p>
        </div>
      </div>
    </div>
  );
}
