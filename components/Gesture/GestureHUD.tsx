"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Hand,
  Pointer,
  ArrowLeftRight,
  ThumbsUp,
  Sparkles,
  Gauge,
} from "lucide-react";
import type { CameraStatus } from "@/types/hand";
import type { GestureEvent, GestureType } from "@/types/gesture";
import { GlassPanel } from "@/components/UI/GlassPanel";
import { StatusBadge } from "@/components/UI/StatusBadge";

interface GestureHUDProps {
  gesture: GestureEvent;
  cameraStatus: CameraStatus;
  fps: number;
  handDetected: boolean;
}

const GESTURE_META: Record<GestureType, { label: string; Icon: typeof Hand }> = {
  none: { label: "No gesture", Icon: Hand },
  open_palm: { label: "Open Palm — Launcher", Icon: Hand },
  pinch: { label: "Pinch — Click", Icon: Pointer },
  swipe_left: { label: "Swipe Left — Previous", Icon: ArrowLeftRight },
  swipe_right: { label: "Swipe Right — Next", Icon: ArrowLeftRight },
  thumbs_up: { label: "Thumbs Up — Save", Icon: ThumbsUp },
  peace_sign: { label: "Peace Sign — Spotlight", Icon: Sparkles },
  fist: { label: "Fist — Close Window", Icon: Hand },
};

function cameraTone(status: CameraStatus): "success" | "warning" | "danger" | "neutral" {
  if (status === "streaming") return "success";
  if (status === "requesting" || status === "granted") return "warning";
  if (status === "denied" || status === "error") return "danger";
  return "neutral";
}

function cameraLabel(status: CameraStatus): string {
  switch (status) {
    case "streaming":
      return "Camera live";
    case "requesting":
      return "Requesting access…";
    case "granted":
      return "Initializing…";
    case "denied":
      return "Access denied";
    case "error":
      return "Camera error";
    default:
      return "Camera off";
  }
}

export function GestureHUD({ gesture, cameraStatus, fps, handDetected }: GestureHUDProps) {
  const meta = GESTURE_META[gesture.type];
  const Icon = meta.Icon;

  return (
    <div className="pointer-events-none fixed left-6 top-6 z-[60] flex flex-col gap-3">
      <GlassPanel strong className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="bg-aurora bg-clip-text text-transparent">GestureOS</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge label={cameraLabel(cameraStatus)} tone={cameraTone(cameraStatus)} pulse={cameraStatus === "streaming"} />
            <StatusBadge
              label={handDetected ? "Hand tracked" : "No hand"}
              tone={handDetected ? "info" : "neutral"}
              pulse={handDetected}
            />
            <StatusBadge label={`${fps} FPS`} tone={fps > 20 ? "success" : fps > 10 ? "warning" : "danger"} />
          </div>
        </div>
      </GlassPanel>

      <AnimatePresence mode="wait">
        {gesture.type !== "none" && (
          <motion.div
            key={gesture.type + Math.round(gesture.timestamp / 300)}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <GlassPanel strong className="pointer-events-auto w-64 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-aurora/20 text-accent-blue">
                  <Icon size={16} />
                </span>
                {meta.label}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Gauge size={12} className="text-white/40" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-aurora"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(gesture.confidence * 100)}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
                <span className="w-9 text-right text-[11px] tabular-nums text-white/50">
                  {Math.round(gesture.confidence * 100)}%
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
