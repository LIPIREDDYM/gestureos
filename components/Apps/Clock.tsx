"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Timer, Clock as ClockIcon, Globe } from "lucide-react";

type Tab = "clock" | "stopwatch" | "timer";

const WORLD_CLOCKS = [
  { city: "New York", tz: "America/New_York", flag: "🇺🇸" },
  { city: "London", tz: "Europe/London", flag: "🇬🇧" },
  { city: "Dubai", tz: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Bangalore", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { city: "Tokyo", tz: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Sydney", tz: "Australia/Sydney", flag: "🇦🇺" },
];

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function AnalogClock({ date }: { date: Date }) {
  const s = date.getSeconds();
  const m = date.getMinutes();
  const h = date.getHours() % 12;
  const sDeg = s * 6;
  const mDeg = m * 6 + s * 0.1;
  const hDeg = h * 30 + m * 0.5;

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40">
      {/* Face */}
      <circle cx="60" cy="60" r="58" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Hour ticks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 60 + 50 * Math.sin(angle);
        const y1 = 60 - 50 * Math.cos(angle);
        const x2 = 60 + 55 * Math.sin(angle);
        const y2 = 60 - 55 * Math.cos(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />;
      })}
      {/* Hour hand */}
      <line
        x1="60" y1="60"
        x2={60 + 28 * Math.sin((hDeg * Math.PI) / 180)}
        y2={60 - 28 * Math.cos((hDeg * Math.PI) / 180)}
        stroke="white" strokeWidth="3" strokeLinecap="round"
        style={{ transition: "all 0.5s ease" }}
      />
      {/* Minute hand */}
      <line
        x1="60" y1="60"
        x2={60 + 40 * Math.sin((mDeg * Math.PI) / 180)}
        y2={60 - 40 * Math.cos((mDeg * Math.PI) / 180)}
        stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"
        style={{ transition: "all 0.5s ease" }}
      />
      {/* Second hand */}
      <line
        x1="60" y1="60"
        x2={60 + 48 * Math.sin((sDeg * Math.PI) / 180)}
        y2={60 - 48 * Math.cos((sDeg * Math.PI) / 180)}
        stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round"
      />
      <circle cx="60" cy="60" r="3" fill="#0A84FF" />
    </svg>
  );
}

export function Clock() {
  const [tab, setTab] = useState<Tab>("clock");
  const [now, setNow] = useState(new Date());

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swMs, setSwMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  const [timerInput, setTimerInput] = useState({ h: 0, m: 5, s: 0 });
  const [timerMs, setTimerMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Stopwatch
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwMs((ms) => ms + 10), 10);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  // Timer
  useEffect(() => {
    if (timerRunning && timerMs > 0) {
      timerRef.current = setInterval(() => {
        setTimerMs((ms) => {
          if (ms <= 10) { setTimerRunning(false); return 0; }
          return ms - 10;
        });
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerMs]);

  const startTimer = () => {
    const total = (timerInput.h * 3600 + timerInput.m * 60 + timerInput.s) * 1000;
    if (total > 0) { setTimerMs(total); setTimerRunning(true); }
  };

  const fmtSw = `${pad(swMs / 60000)}:${pad((swMs % 60000) / 1000)}.${pad((swMs % 1000) / 10)}`;
  const fmtTimer = `${pad(timerMs / 3600000)}:${pad((timerMs % 3600000) / 60000)}:${pad((timerMs % 60000) / 1000)}`;

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "clock", icon: <ClockIcon size={14} />, label: "Clock" },
    { id: "stopwatch", icon: <Timer size={14} />, label: "Stopwatch" },
    { id: "timer", icon: <Timer size={14} />, label: "Timer" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs transition ${
              tab === t.id ? "border-b-2 border-accent-blue text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 no-scrollbar">
        {tab === "clock" && (
          <div className="flex flex-col items-center gap-6 w-full">
            <AnalogClock date={now} />
            <p className="text-4xl font-light tabular-nums tracking-tight">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-sm text-white/40">
              {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="w-full space-y-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-white/30 mb-1">
                <Globe size={11} /> World Clocks
              </div>
              {WORLD_CLOCKS.map(({ city, tz, flag }) => (
                <div key={city} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
                  <span className="text-white/60">{flag} {city}</span>
                  <span className="tabular-nums text-white/80">
                    {new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "stopwatch" && (
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="text-5xl font-light tabular-nums tracking-tight">{fmtSw}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSwRunning((r) => !r)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue text-white transition hover:brightness-110"
              >
                {swRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              <button
                onClick={() => { setSwMs(0); setSwRunning(false); setLaps([]); }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
              >
                <RotateCcw size={16} />
              </button>
              {swRunning && (
                <button
                  onClick={() => setLaps((l) => [swMs, ...l])}
                  className="rounded-full bg-white/10 px-4 text-xs text-white/60 transition hover:bg-white/20"
                >
                  Lap
                </button>
              )}
            </div>
            {laps.length > 0 && (
              <div className="w-full space-y-1">
                {laps.map((lap, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 tabular-nums">
                    <span>Lap {laps.length - i}</span>
                    <span>{pad(lap / 60000)}:{pad((lap % 60000) / 1000)}.{pad((lap % 1000) / 10)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "timer" && (
          <div className="flex flex-col items-center gap-6 w-full">
            {timerRunning || timerMs > 0 ? (
              <>
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke="#0A84FF" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(timerMs / ((timerInput.h * 3600 + timerInput.m * 60 + timerInput.s) * 1000)) * 339} 339`}
                      transform="rotate(-90 60 60)"
                      style={{ filter: "drop-shadow(0 0 6px #0A84FF)", transition: "stroke-dasharray 0.1s" }}
                    />
                  </svg>
                  <p className="text-2xl font-light tabular-nums">{fmtTimer}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTimerRunning((r) => !r)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue text-white"
                  >
                    {timerRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                  <button
                    onClick={() => { setTimerMs(0); setTimerRunning(false); }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/40">Set timer duration</p>
                <div className="flex items-center gap-3 text-3xl font-light tabular-nums">
                  {(["h", "m", "s"] as const).map((unit, idx) => (
                    <div key={unit} className="flex flex-col items-center gap-1">
                      <button onClick={() => setTimerInput((t) => ({ ...t, [unit]: Math.min(unit === "h" ? 23 : 59, t[unit] + 1) }))} className="text-white/30 hover:text-white text-lg">▲</button>
                      <span>{pad(timerInput[unit])}</span>
                      <button onClick={() => setTimerInput((t) => ({ ...t, [unit]: Math.max(0, t[unit] - 1) }))} className="text-white/30 hover:text-white text-lg">▼</button>
                      <span className="text-xs text-white/30">{unit}</span>
                    </div>
                  ))}
                </div>
                <button onClick={startTimer} className="rounded-full bg-accent-blue px-8 py-2.5 text-sm font-medium text-white transition hover:brightness-110">
                  Start
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
