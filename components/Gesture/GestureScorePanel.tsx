"use client";

import { motion } from "framer-motion";
import type { HandFrame } from "@/types/hand";
import {
  detectOpenPalm, detectFist, detectPinch,
  detectThumbsUp, detectPeaceSign, getFingerState,
} from "@/lib/gestures/gestureDetectors";
import { DEFAULT_GESTURE_CONFIG } from "@/types/gesture";
import { GlassPanel } from "@/components/UI/GlassPanel";

interface GestureScorePanelProps {
  frame: HandFrame | null;
}

const GESTURE_ROWS = [
  { key: "open_palm", label: "Open Palm", emoji: "✋", color: "bg-accent-blue" },
  { key: "pinch",     label: "Pinch",     emoji: "🤏", color: "bg-accent-purple" },
  { key: "fist",      label: "Fist",      emoji: "👊", color: "bg-accent-pink" },
  { key: "thumbs_up", label: "Thumbs Up", emoji: "👍", color: "bg-accent-green" },
  { key: "peace_sign",label: "Peace",     emoji: "✌️", color: "bg-accent-teal" },
] as const;

export function GestureScorePanel({ frame }: GestureScorePanelProps) {
  if (!frame) {
    return (
      <GlassPanel strong className="w-56 rounded-2xl p-3">
        <p className="text-[10px] uppercase tracking-wide text-white/30 mb-2">Gesture Scores</p>
        <p className="text-xs text-white/20 text-center py-2">No hand detected</p>
      </GlassPanel>
    );
  }

  const fingers = getFingerState(frame);
  const cfg = DEFAULT_GESTURE_CONFIG;

  const scores: Record<string, number> = {
    open_palm: detectOpenPalm(fingers),
    pinch:     detectPinch(frame, fingers, cfg.pinchThreshold),
    fist:      detectFist(fingers),
    thumbs_up: detectThumbsUp(frame, fingers),
    peace_sign: detectPeaceSign(frame, fingers),
  };

  return (
    <GlassPanel strong className="w-56 rounded-2xl p-3">
      <p className="text-[10px] uppercase tracking-wide text-white/30 mb-2.5">Live Gesture Scores</p>
      <div className="space-y-1.5">
        {GESTURE_ROWS.map(({ key, label, emoji, color }) => {
          const score = scores[key] ?? 0;
          const pct = Math.round(score * 100);
          const isActive = score >= cfg.minConfidence;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-5 text-sm">{emoji}</span>
              <div className="flex-1">
                <div className="mb-0.5 flex justify-between">
                  <span className={`text-[10px] ${isActive ? "text-white" : "text-white/40"}`}>{label}</span>
                  <span className={`text-[10px] tabular-nums ${isActive ? "text-white" : "text-white/30"}`}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isActive ? color : "bg-white/20"}`}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.15 }}
                    style={{ boxShadow: isActive ? undefined : "none" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[9px] text-white/20 text-center">
        Threshold: {Math.round(cfg.minConfidence * 100)}%
      </p>
    </GlassPanel>
  );
}
