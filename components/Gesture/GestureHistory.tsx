"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useGestureHistory } from "@/hooks/useGestureHistory";
import { GlassPanel } from "@/components/UI/GlassPanel";

const EMOJI: Record<string, string> = {
  open_palm: "✋", pinch: "🤏", fist: "👊",
  thumbs_up: "👍", peace_sign: "✌️",
  swipe_left: "👈", swipe_right: "👉", none: "—",
};

const COLOR: Record<string, string> = {
  open_palm: "text-accent-blue", pinch: "text-accent-purple", fist: "text-accent-pink",
  thumbs_up: "text-accent-green", peace_sign: "text-accent-teal",
  swipe_left: "text-accent-amber", swipe_right: "text-accent-amber",
};

export function GestureHistory() {
  const { history, clear } = useGestureHistory();

  return (
    <GlassPanel strong className="w-56 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wide text-white/30">Gesture Log</p>
        {history.length > 0 && (
          <button onClick={clear} className="text-white/20 hover:text-white/50 transition">
            <Trash2 size={11} />
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto no-scrollbar">
        {history.length === 0 && (
          <p className="py-6 text-center text-[10px] text-white/20">No gestures yet</p>
        )}
        <AnimatePresence initial={false}>
          {history.map((e, i) => (
            <motion.div key={`${e.timestamp}-${i}`}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2"
            >
              <span className="text-base">{EMOJI[e.type] ?? "—"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium capitalize ${COLOR[e.type] ?? "text-white/50"}`}>
                  {e.type.replace("_", " ")}
                </p>
                <div className="mt-0.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue/60" style={{ width: `${Math.round(e.confidence * 100)}%` }} />
                </div>
              </div>
              <span className="text-[9px] tabular-nums text-white/20">
                {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
