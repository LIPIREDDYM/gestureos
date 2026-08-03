"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Battery, Cpu, Clock } from "lucide-react";
import { useWindowManager } from "@/hooks/useWindowManager";

interface WidgetBarProps {
  fps: number;
  handDetected: boolean;
  gestureEnabled: boolean;
}

export function WidgetBar({ fps, handDetected, gestureEnabled }: WidgetBarProps) {
  const [time, setTime] = useState(new Date());
  const [visible, setVisible] = useState(true);
  const { windows } = useWindowManager();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none fixed right-4 top-14 z-40 flex flex-col gap-2"
    >
      {/* Clock widget */}
      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-4 py-3 text-right shadow-glass">
        <p className="text-2xl font-light tabular-nums text-white">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[10px] text-white/40">
          {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>

      {/* System stats */}
      <div className="pointer-events-auto rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-3 py-2 space-y-1.5 shadow-glass">
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-white/30"><Wifi size={10}/> Network</span>
          <span className="text-accent-green">Online</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-white/30"><Cpu size={10}/> Tracking</span>
          <span className={gestureEnabled ? (handDetected ? "text-accent-green" : "text-accent-amber") : "text-white/30"}>
            {gestureEnabled ? (handDetected ? `${fps} FPS` : "No hand") : "Off"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-white/30"><Clock size={10}/> Windows</span>
          <span className="text-white/50">{windows.filter(w => !w.isMinimized).length} open</span>
        </div>
      </div>
    </motion.div>
  );
}
