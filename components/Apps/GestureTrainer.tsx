"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import type { HandFrame } from "@/types/hand";
import {
  detectOpenPalm, detectFist, detectPinch,
  detectThumbsUp, detectPeaceSign, getFingerState,
} from "@/lib/gestures/gestureDetectors";
import { DEFAULT_GESTURE_CONFIG } from "@/types/gesture";
import { loadHands, toHandFrame } from "@/lib/mediapipe/handsSetup";

interface GestureStep {
  id: string;
  emoji: string;
  name: string;
  instruction: string;
  tip: string;
  color: string;
  detector: (frame: HandFrame) => number;
}

const STEPS: GestureStep[] = [
  {
    id: "open_palm", emoji: "✋", name: "Open Palm", color: "#0A84FF",
    instruction: "Spread all four fingers wide open, palm facing the camera.",
    tip: "Thumb doesn't matter — focus on spreading index through pinky.",
    detector: (f) => detectOpenPalm(getFingerState(f)),
  },
  {
    id: "fist", emoji: "👊", name: "Fist", color: "#FF375F",
    instruction: "Curl all fingers tightly into a closed fist.",
    tip: "Wrap fingers firmly — a loose fist won't score well.",
    detector: (f) => detectFist(getFingerState(f)),
  },
  {
    id: "pinch", emoji: "🤏", name: "Pinch", color: "#BF5AF2",
    instruction: "Touch your thumb tip to your index finger tip.",
    tip: "Keep other fingers naturally curled, not extended.",
    detector: (f) => detectPinch(f, getFingerState(f), DEFAULT_GESTURE_CONFIG.pinchThreshold),
  },
  {
    id: "thumbs_up", emoji: "👍", name: "Thumbs Up", color: "#30D158",
    instruction: "Point your thumb straight up, all other fingers curled.",
    tip: "Thumb must point upward — horizontal won't register.",
    detector: (f) => detectThumbsUp(f, getFingerState(f)),
  },
  {
    id: "peace", emoji: "✌️", name: "Peace Sign", color: "#64D2FF",
    instruction: "Extend index and middle fingers in a V, curl ring and pinky.",
    tip: "Spread the two fingers apart — parallel fingers score lower.",
    detector: (f) => detectPeaceSign(f, getFingerState(f)),
  },
];

const THRESHOLD = 0.72;
const HOLD_FRAMES = 12; // frames to hold before passing

interface GestureTrainerProps {
  /** Optional — if provided, uses parent's frame instead of own camera */
  externalFrame?: HandFrame | null;
}

export function GestureTrainer({ externalFrame }: GestureTrainerProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [holdCount, setHoldCount] = useState(0);
  const [passed, setPassed] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  // Own camera pipeline when no external frame
  const [ownFrame, setOwnFrame] = useState<HandFrame | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (externalFrame !== undefined) return; // use external
    cancelRef.current = false;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (cancelRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const hands = await loadHands(0);
        if (cancelRef.current) return;
        handsRef.current = hands;
        hands.onResults((r: any) => { const f = toHandFrame(r); setOwnFrame(f); });
        let busy = false, lastT = 0;
        const loop = async (t: number) => {
          if (cancelRef.current) return;
          if (!busy && t - lastT > 33) {
            lastT = t; busy = true;
            try { await hands.send({ image: video }); } catch {}
            finally { busy = false; }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {}
    })();

    return () => {
      cancelRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(t => t.stop());
      handsRef.current?.close();
    };
  }, [externalFrame]);

  const frame = externalFrame !== undefined ? externalFrame : ownFrame;
  const step = STEPS[stepIdx];

  useEffect(() => {
    if (!frame || !step) return;
    const s = step.detector(frame);
    setScore(s);
    if (s >= THRESHOLD) {
      setHoldCount(c => {
        const next = c + 1;
        if (next >= HOLD_FRAMES) {
          setPassed(p => [...p, step.id]);
          if (stepIdx < STEPS.length - 1) {
            setTimeout(() => { setStepIdx(i => i + 1); setHoldCount(0); setScore(0); }, 600);
          } else {
            setTimeout(() => setComplete(true), 600);
          }
        }
        return next;
      });
    } else {
      setHoldCount(0);
    }
  }, [frame]);

  const reset = () => { setStepIdx(0); setPassed([]); setHoldCount(0); setScore(0); setComplete(false); };

  const pct = Math.round(score * 100);
  const holdPct = Math.round((holdCount / HOLD_FRAMES) * 100);
  const isActive = score >= THRESHOLD;

  if (complete) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent-green to-accent-teal text-5xl shadow-glow">
          🎉
        </motion.div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Training Complete!</h2>
          <p className="mt-1 text-sm text-white/50">You've mastered all {STEPS.length} gestures</p>
        </div>
        <div className="flex gap-3">
          {STEPS.map(s => (
            <span key={s.id} className="text-2xl" title={s.name}>{s.emoji}</span>
          ))}
        </div>
        <button onClick={reset} className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/20">
          <RotateCcw size={14} /> Practice again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-5 gap-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition ${
            passed.includes(s.id) ? "bg-accent-green/20 text-accent-green" :
            i === stepIdx ? "bg-white/10 text-white" : "bg-white/[0.04] text-white/20"
          }`}>
            {passed.includes(s.id) ? <CheckCircle2 size={14} /> : s.emoji}
          </div>
        ))}
        <span className="ml-auto text-xs text-white/30">{stepIdx + 1} / {STEPS.length}</span>
      </div>

      {/* Current gesture card */}
      <AnimatePresence mode="wait">
        <motion.div key={step.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
            style={{ background: step.color + "22" }}>
            {step.emoji}
          </div>
          <h3 className="text-lg font-semibold text-white">{step.name}</h3>
          <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{step.instruction}</p>
          <div className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/35">
            💡 {step.tip}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Live score */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/40">
          <span>Detection score</span>
          <span className={`tabular-nums font-medium ${isActive ? "text-accent-green" : "text-white/50"}`}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full transition-colors"
            style={{ background: isActive ? step.color : "rgba(255,255,255,0.2)" }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.1 }} />
        </div>

        {isActive && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/40">
              <span>Hold steady…</span>
              <span className="text-accent-green tabular-nums">{holdPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-accent-green"
                animate={{ width: `${holdPct}%` }} transition={{ duration: 0.08 }} />
            </div>
          </div>
        )}

        <div className={`text-center text-xs ${isActive ? "text-accent-green" : "text-white/25"}`}>
          {isActive ? "✓ Gesture detected — hold it!" : frame ? "Show your hand to the camera" : "Camera not active"}
        </div>
      </div>

      {/* Skip button */}
      <button onClick={() => { if (stepIdx < STEPS.length - 1) { setStepIdx(i => i + 1); setHoldCount(0); setScore(0); } else setComplete(true); }}
        className="mt-auto flex items-center justify-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition">
        Skip this gesture <ChevronRight size={12} />
      </button>

      {externalFrame === undefined && (
        <video ref={videoRef} playsInline muted className="hidden" />
      )}
    </div>
  );
}
