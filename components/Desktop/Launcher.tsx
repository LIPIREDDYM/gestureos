"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  StickyNote,
  Music2,
  CloudSun,
  Calculator as CalculatorIcon,
  Image as ImageIcon,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { GlassPanel } from "@/components/UI/GlassPanel";

const ICONS: Record<string, LucideIcon> = {
  StickyNote,
  Music2,
  CloudSun,
  Calculator: CalculatorIcon,
  Image: ImageIcon,
  Sparkles,
};

const DWELL_MS = 1200; // hover this long to auto-launch via gesture cursor

/**
 * DwellButton — wraps each app tile and auto-fires onClick after the user
 * hovers for DWELL_MS without moving away. This means you can navigate the
 * launcher purely with the gesture cursor without needing to pinch.
 */
function DwellButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startDwell = () => {
    startTimeRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - (startTimeRef.current ?? 0);
      const progress = Math.min(elapsed / DWELL_MS, 1);
      setDwellProgress(progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onClick();
        setDwellProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelDwell = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    setDwellProgress(0);
    startTimeRef.current = null;
  };

  return (
    <div
      className={`relative ${className ?? ""}`}
      onMouseEnter={startDwell}
      onMouseLeave={cancelDwell}
    >
      {children}
      {/* Dwell progress arc */}
      {dwellProgress > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(10,132,255,0.25)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#0A84FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dwellProgress * 289} 289`}
            transform="rotate(-90 50 50)"
            style={{ filter: "drop-shadow(0 0 6px #0A84FF)" }}
          />
        </svg>
      )}
    </div>
  );
}

export function Launcher() {
  const { isLauncherOpen, setLauncherOpen, openApp } = useWindowManager();

  return (
    <AnimatePresence>
      {isLauncherOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at center, rgba(10,10,20,0.85) 0%, rgba(5,5,7,0.97) 100%)",
            backdropFilter: "blur(24px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={() => setLauncherOpen(false)}
        >
          {/* Subtle grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* Close button */}
            <button
              onClick={() => setLauncherOpen(false)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/50 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            >
              <X size={14} />
            </button>

            <GlassPanel strong className="w-[580px] rounded-3xl p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/30">
                  ✋ Open Palm Detected
                </p>
                <h2 className="text-2xl font-semibold text-gradient-aurora">App Launcher</h2>
                <p className="mt-1.5 text-xs text-white/30">
                  Pinch to open · Hover 1.2s to auto-select
                </p>
              </div>

              {/* App grid */}
              <div className="grid grid-cols-3 gap-3">
                {APP_REGISTRY.map((app, i) => {
                  const Icon = ICONS[app.icon] ?? Sparkles;
                  return (
                    <DwellButton
                      key={app.id}
                      onClick={() => openApp(app.id)}
                      className="rounded-2xl"
                    >
                      <motion.button
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 22 }}
                        whileHover={{ scale: 1.07, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openApp(app.id)}
                        className="group flex w-full flex-col items-center gap-2.5 rounded-2xl border border-white/0 p-5 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06]"
                      >
                        <div
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${app.accent} shadow-lg transition-shadow duration-200 group-hover:shadow-glow`}
                        >
                          <Icon size={26} className="text-white drop-shadow" />
                        </div>
                        <span className="text-xs font-medium text-white/60 transition group-hover:text-white/90">
                          {app.title}
                        </span>
                      </motion.button>
                    </DwellButton>
                  );
                })}
              </div>

              {/* Tip bar */}
              <div className="mt-6 flex items-center justify-center gap-6 border-t border-white/[0.06] pt-4">
                <Tip icon="🤏" label="Pinch to click" />
                <Tip icon="✋" label="Palm again to close" />
                <Tip icon="⏱" label="Hover 1.2s auto-opens" />
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-white/30">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
