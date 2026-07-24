"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface GestureCursorProps {
  cursor: { x: number; y: number } | null;
  isPinching: boolean;
  visible: boolean;
}

/**
 * Renders a glowing dot at the mirrored screen position of the user's index
 * fingertip. Positioned with fixed inset-0 + transform so it can track at
 * 60fps via Framer Motion without triggering layout thrash.
 */
export function GestureCursor({ cursor, isPinching, visible }: GestureCursorProps) {
  if (!cursor || !visible) return null;

  // Mirror x to match the mirrored camera feed so pointer motion feels natural.
  const left = `${(1 - cursor.x) * 100}%`;
  const top = `${cursor.y * 100}%`;

  return (
    <motion.div
      className="pointer-events-none fixed z-[70]"
      style={{ left, top }}
      animate={{ left, top }}
      transition={{ type: "tween", duration: 0.08, ease: "easeOut" }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: isPinching ? 0.55 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "h-7 w-7 rounded-full border-2 shadow-glow",
            isPinching ? "border-accent-pink bg-accent-pink/30" : "border-accent-blue bg-accent-blue/20"
          )}
        />
        {isPinching && (
          <span className="absolute inset-0 -m-2 rounded-full border border-accent-pink/50 animate-pulse-ring" />
        )}
      </div>
    </motion.div>
  );
}
