"use client";

import { motion } from "framer-motion";
import { BarChart2, RotateCcw, Clock } from "lucide-react";
import { useAppUsage } from "@/hooks/useAppUsage";
import { useWindowManager } from "@/hooks/useWindowManager";
import { APP_REGISTRY } from "./appRegistry";
import { ICON_MAP } from "@/components/Desktop/Dock";
import { Sparkles } from "lucide-react";

function fmtMs(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function AppUsage() {
  const { usage, reset } = useAppUsage();
  const { windows } = useWindowManager();

  const entries = Object.entries(usage)
    .filter(([, ms]) => (ms ?? 0) > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));

  const totalMs = entries.reduce((s, [, ms]) => s + (ms ?? 0), 0);
  const maxMs = entries[0]?.[1] ?? 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-white/40" />
          <span className="text-xs text-white/60">
            Total: {fmtMs(totalMs)}
          </span>
        </div>
        <button onClick={reset}
          className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/40 hover:bg-white/10 transition">
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3">
        {entries.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-white/20">
            <BarChart2 size={28} />
            <p className="text-sm">No usage data yet</p>
            <p className="text-[10px] text-center">Open apps and use them to see time tracking here</p>
          </div>
        )}

        {entries.map(([appId, ms], i) => {
          const def = APP_REGISTRY.find(a => a.id === appId);
          if (!def) return null;
          const Icon = ICON_MAP[def.icon] ?? Sparkles;
          const pct = ((ms ?? 0) / (maxMs ?? 1)) * 100;
          const isOpen = windows.some(w => w.appId === appId && !w.isMinimized);

          return (
            <motion.div key={appId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${def.accent}`}>
                  <Icon size={13} className="text-white" />
                </div>
                <span className="flex-1 text-xs text-white/70">{def.title}</span>
                {isOpen && <span className="h-1.5 w-1.5 rounded-full bg-accent-green" title="Currently open" />}
                <span className="text-[10px] tabular-nums text-white/40">{fmtMs(ms ?? 0)}</span>
                <span className="w-8 text-right text-[9px] text-white/25">{Math.round(((ms ?? 0) / totalMs) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${def.accent}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
