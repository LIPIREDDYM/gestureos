import { useEffect, useRef, useState } from "react";
import { LandmarkIndex, type HandFrame } from "@/types/hand";
import { DEFAULT_GESTURE_CONFIG, type GestureConfig, type GestureEvent, type GestureType } from "@/types/gesture";
import {
  detectFist,
  detectOpenPalm,
  detectPeaceSign,
  detectPinch,
  detectThumbsUp,
  getFingerState,
} from "@/lib/gestures/gestureDetectors";
import { EmaSmoother } from "@/utils/math";

interface UseGestureRecognitionOptions {
  frame: HandFrame | null;
  config?: Partial<GestureConfig>;
  /** Called whenever a *new* discrete gesture is confidently recognized. */
  onGesture?: (event: GestureEvent) => void;
}

interface UseGestureRecognitionReturn {
  gesture: GestureEvent;
  /** Smoothed cursor position (normalized 0..1) for pointer-style interactions. */
  cursor: { x: number; y: number } | null;
}

const IDLE_GESTURE: GestureEvent = { type: "none", confidence: 0, timestamp: 0, cursor: null };

/**
 * Static gestures (palm, fist, pinch, thumbs up, peace) are scored every
 * frame from hand shape alone. Swipes are different: they're a *motion*
 * pattern, so we track the index fingertip's x position over a short time
 * window and infer a swipe when it travels far enough, fast enough, while
 * the hand is roughly open (to avoid confusing a pinch-and-drag with a
 * swipe).
 */
export function useGestureRecognition({
  frame,
  config,
  onGesture,
}: UseGestureRecognitionOptions): UseGestureRecognitionReturn {
  const cfg: GestureConfig = { ...DEFAULT_GESTURE_CONFIG, ...config };
  const [gesture, setGesture] = useState<GestureEvent>(IDLE_GESTURE);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const lastEmittedRef = useRef<{ type: GestureType; time: number }>({ type: "none", time: 0 });
  const swipeHistoryRef = useRef<{ x: number; t: number }[]>([]);
  const smootherX = useRef(new EmaSmoother(0.4));
  const smootherY = useRef(new EmaSmoother(0.4));

  useEffect(() => {
    if (!frame) {
      setGesture(IDLE_GESTURE);
      setCursor(null);
      swipeHistoryRef.current = [];
      smootherX.current.reset();
      smootherY.current.reset();
      return;
    }

    const now = frame.timestamp;
    const indexTip = frame.landmarks[LandmarkIndex.INDEX_TIP];
    const smoothedCursor = {
      x: smootherX.current.next(indexTip.x),
      y: smootherY.current.next(indexTip.y),
    };
    setCursor(smoothedCursor);

    const fingers = getFingerState(frame);

    const scores: Record<Exclude<GestureType, "swipe_left" | "swipe_right" | "none">, number> = {
      open_palm: detectOpenPalm(fingers),
      fist: detectFist(frame ? fingers : fingers),
      pinch: detectPinch(frame, fingers, cfg.pinchThreshold),
      thumbs_up: detectThumbsUp(frame, fingers),
      peace_sign: detectPeaceSign(frame, fingers),
    };

    // --- Swipe tracking: only while the hand is reasonably open (not mid-pinch) ---
    const history = swipeHistoryRef.current;
    if (scores.pinch < 0.5) {
      history.push({ x: indexTip.x, t: now });
    }
    while (history.length > 0 && now - history[0].t > cfg.swipeWindowMs) {
      history.shift();
    }

    let swipeType: "swipe_left" | "swipe_right" | null = null;
    let swipeConfidence = 0;
    if (history.length >= 2) {
      const dx = history[history.length - 1].x - history[0].x;
      const dt = Math.max(1, history[history.length - 1].t - history[0].t);
      const speed = Math.abs(dx) / (dt / 1000); // normalized units per second
      if (Math.abs(dx) > cfg.swipeThreshold && speed > 0.35) {
        swipeType = dx < 0 ? "swipe_left" : "swipe_right";
        swipeConfidence = Math.min(1, Math.abs(dx) / (cfg.swipeThreshold * 1.6));
      }
    }

    // Pick the best candidate among static gestures + swipe.
    let bestType: GestureType = "none";
    let bestConfidence = cfg.minConfidence; // acts as a floor
    (Object.keys(scores) as (keyof typeof scores)[]).forEach((key) => {
      if (scores[key] > bestConfidence) {
        bestConfidence = scores[key];
        bestType = key;
      }
    });
    if (swipeType && swipeConfidence > bestConfidence) {
      bestType = swipeType;
      bestConfidence = swipeConfidence;
    }

    const next: GestureEvent = {
      type: bestType,
      confidence: bestType === "none" ? 0 : bestConfidence,
      timestamp: now,
      cursor: smoothedCursor,
    };
    setGesture(next);

    // Emit discrete gesture events with a cooldown so a held pose (e.g.
    // holding thumbs-up for 2s) doesn't spam "save" repeatedly.
    const isDiscrete = bestType !== "none" && bestType !== "open_palm" && bestType !== "fist";
    if (isDiscrete) {
      const last = lastEmittedRef.current;
      const cooledDown = now - last.time > cfg.cooldownMs || last.type !== bestType;
      if (cooledDown) {
        lastEmittedRef.current = { type: bestType, time: now };
        onGesture?.(next);
        if (swipeType) {
          swipeHistoryRef.current = []; // reset so we don't double-fire the same swipe
        }
      }
    } else if (bestType === "open_palm") {
      // Open palm is treated as "continuous" (fires on entry only) so the
      // launcher opens once per gesture, not every frame it's held.
      const last = lastEmittedRef.current;
      if (last.type !== "open_palm" || now - last.time > cfg.cooldownMs) {
        lastEmittedRef.current = { type: "open_palm", time: now };
        onGesture?.(next);
      }
    }
  }, [frame]); // eslint-disable-line react-hooks/exhaustive-deps

  return { gesture, cursor };
}
