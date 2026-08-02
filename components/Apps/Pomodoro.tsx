"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

type Phase = "focus" | "short" | "long";

const PHASES: Record<Phase, { label: string; minutes: number; color: string; accent: string }> = {
  focus:  { label: "Focus",       minutes: 25, color: "#0A84FF", accent: "text-accent-blue" },
  short:  { label: "Short Break", minutes: 5,  color: "#30D158", accent: "text-accent-green" },
  long:   { label: "Long Break",  minutes: 15, color: "#BF5AF2", accent: "text-accent-purple" },
};

const SEQUENCE: Phase[] = ["focus", "short", "focus", "short", "focus", "short", "focus", "long"];

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

export function Pomodoro() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PHASES.focus.minutes * 60);
  const [completed, setCompleted] = useState(0); // total focus sessions done
  const [customMins, setCustomMins] = useState<Record<Phase, number>>({
    focus: 25, short: 5, long: 15,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = SEQUENCE[phaseIdx % SEQUENCE.length];
  const cfg = PHASES[phase];
  const totalSeconds = customMins[phase] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    setSecondsLeft(customMins[phase] * 60);
    setRunning(false);
  }, [phaseIdx]);// eslint-disable-line

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (phase === "focus") setCompleted((c) => c + 1);
            // Auto advance
            setPhaseIdx((i) => i + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(customMins[phase] * 60);
  };

  const skip = () => setPhaseIdx((i) => i + 1);

  return (
    <div className="flex h-full flex-col items-center justify-between p-6">
      {/* Phase tabs */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        {(Object.keys(PHASES) as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => { setPhaseIdx(SEQUENCE.indexOf(p)); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${phase === p ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            {PHASES[p].label}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke={cfg.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 70 70)"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.color})`, transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-light tabular-nums">
            {pad(secondsLeft / 60)}:{pad(secondsLeft % 60)}
          </span>
          <span className={`text-xs font-medium ${cfg.accent}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white">
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white transition hover:brightness-110"
          style={{ background: cfg.color, boxShadow: `0 0 20px ${cfg.color}55` }}
        >
          {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <button onClick={skip} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white">
          <SkipForward size={16} />
        </button>
      </div>

      {/* Stats + custom durations */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-2.5">
          <span className="text-xs text-white/50">Focus sessions today</span>
          <span className="text-sm font-semibold tabular-nums text-accent-blue">{completed}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(customMins) as [Phase, number][]).map(([p, m]) => (
            <div key={p} className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.04] p-2">
              <span className="text-[9px] text-white/30">{PHASES[p].label}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCustomMins((c) => ({ ...c, [p]: Math.max(1, c[p] - 1) }))} className="text-white/30 hover:text-white text-xs">−</button>
                <span className="text-xs tabular-nums text-white/70 w-4 text-center">{m}</span>
                <button onClick={() => setCustomMins((c) => ({ ...c, [p]: Math.min(60, c[p] + 1) }))} className="text-white/30 hover:text-white text-xs">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
