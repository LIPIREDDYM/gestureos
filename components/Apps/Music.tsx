"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music2 } from "lucide-react";

const PLAYLIST = [
  { title: "Nebula Drift", artist: "Aurora Bay", duration: 214, gradient: "from-accent-blue to-accent-purple" },
  { title: "Glass Horizon", artist: "Kilo North", duration: 187, gradient: "from-accent-purple to-accent-pink" },
  { title: "Midnight Circuit", artist: "Vela", duration: 251, gradient: "from-accent-teal to-accent-blue" },
  { title: "Paper Planets", artist: "Sonder", duration: 198, gradient: "from-accent-green to-accent-teal" },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function Music() {
  const [trackIndex, setTrackIndex] = useState(() => {
    try { return Number(localStorage.getItem("gestureos:music:track") ?? 0); } catch { return 0; }
  });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const track = PLAYLIST[trackIndex];

  // Persist current track
  useEffect(() => {
    try { localStorage.setItem("gestureos:music:track", String(trackIndex)); } catch {/* ignore */}
  }, [trackIndex]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p + 1 >= track.duration ? 0 : p + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, track.duration]);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-4">
        <motion.div
          layout
          className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${track.gradient} shadow-glow`}
          animate={{ rotate: playing ? 360 : 0 }}
          transition={{ repeat: playing ? Infinity : 0, duration: 12, ease: "linear" }}
        >
          <Music2 size={30} className="text-white/90" />
        </motion.div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{track.title}</p>
          <p className="truncate text-sm text-white/50">{track.artist}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-aurora transition-[width] duration-1000 ease-linear"
            style={{ width: `${(progress / track.duration) * 100}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/40 tabular-nums">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => setTrackIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length)}
          className="text-white/60 transition hover:text-white"
        >
          <SkipBack size={22} />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
        >
          {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        <button
          onClick={() => setTrackIndex((i) => (i + 1) % PLAYLIST.length)}
          className="text-white/60 transition hover:text-white"
        >
          <SkipForward size={22} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-white/40">
        <Volume2 size={14} />
        <div className="h-1 flex-1 rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-white/40" />
        </div>
      </div>

      <div className="mt-6 flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {PLAYLIST.map((t, i) => (
          <button
            key={t.title}
            onClick={() => {
              setTrackIndex(i);
              setProgress(0);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition ${
              i === trackIndex ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${t.gradient}`} />
            <span className="flex-1 truncate">{t.title}</span>
            <span className="text-xs text-white/40">{formatTime(t.duration)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
