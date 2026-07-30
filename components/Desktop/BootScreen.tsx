"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_LINES = [
  "Initializing GestureOS kernel…",
  "Loading MediaPipe WASM runtime…",
  "Calibrating hand tracking pipeline…",
  "Starting gesture recognition engine…",
  "Mounting virtual filesystem…",
  "Loading aurora renderer…",
  "Starting window compositor…",
  "GestureOS ready.",
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setDone(true), 400);
        setTimeout(() => onComplete(), 1200);
      }
    }, 220);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#03030a]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12 flex flex-col items-center gap-3"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink shadow-[0_0_60px_rgba(10,132,255,0.4)]">
              <span className="text-3xl">✋</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gradient-aurora">GestureOS</h1>
            <p className="text-sm text-white/30">Gesture-Powered Desktop</p>
          </motion.div>

          {/* Boot log */}
          <div className="w-96 space-y-1 font-mono text-xs">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={line.includes("ready") ? "text-accent-green" : "text-white/40"}
              >
                <span className="text-accent-blue/60 mr-2">[{String(i).padStart(2, "0")}]</span>
                {line}
              </motion.div>
            ))}
            {lines.length > 0 && lines.length < BOOT_LINES.length && (
              <span className="inline-block h-3 w-1.5 animate-pulse bg-accent-blue/70 ml-6" />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
