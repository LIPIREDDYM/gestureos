"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { GlassPanel } from "@/components/UI/GlassPanel";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: "✋",
    title: "Open Palm",
    subtitle: "Open the App Launcher",
    description: "Hold all four fingers open and spread out facing the camera. Hold for half a second until the launcher opens.",
    tip: "Keep your hand 30–60 cm from the camera",
    color: "from-accent-blue to-accent-purple",
  },
  {
    emoji: "🤏",
    title: "Pinch",
    subtitle: "Click anything",
    description: "Bring your thumb and index finger tip together slowly. The blue cursor ring will shrink to confirm the click.",
    tip: "Aim the cursor first, then pinch",
    color: "from-accent-purple to-accent-pink",
  },
  {
    emoji: "✌️",
    title: "Peace Sign",
    subtitle: "Open AI Assistant",
    description: "Extend your index and middle fingers in a V shape. Keep ring and pinky fingers curled.",
    tip: "Spread the two fingers apart for better detection",
    color: "from-accent-teal to-accent-blue",
  },
  {
    emoji: "👊",
    title: "Fist",
    subtitle: "Close active window",
    description: "Curl all fingers into a tight fist. Hold for a moment to close the currently focused window.",
    tip: "Make sure a window is selected first",
    color: "from-accent-pink to-accent-amber",
  },
  {
    emoji: "👍",
    title: "Thumbs Up",
    subtitle: "Save your work",
    description: "Extend only your thumb upward with all other fingers curled. Works as a save command in the Notes app.",
    tip: "Point thumb straight up for best detection",
    color: "from-accent-green to-accent-teal",
  },
  {
    emoji: "👉",
    title: "Swipe",
    subtitle: "Navigate pages",
    description: "Quickly flick your open hand left or right to switch between virtual desktop pages.",
    tip: "Make it a fast flick, not a slow drag",
    color: "from-accent-amber to-accent-pink",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[190] flex items-center justify-center"
      style={{ background: "rgba(3,3,10,0.92)", backdropFilter: "blur(20px)" }}
    >
      <div className="w-[480px]">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-accent-blue" : i < step ? "w-1.5 bg-accent-blue/40" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
          >
            <GlassPanel strong className="rounded-3xl p-8 text-center">
              <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${current.color} shadow-glow`}>
                <span className="text-5xl">{current.emoji}</span>
              </div>

              <p className="mb-1 text-xs uppercase tracking-widest text-white/30">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="mb-1 text-2xl font-semibold text-white">{current.title}</h2>
              <p className="mb-4 text-sm font-medium text-gradient-aurora">{current.subtitle}</p>
              <p className="mb-5 text-sm leading-relaxed text-white/60">{current.description}</p>

              <div className="mb-6 rounded-xl bg-white/[0.04] px-4 py-2.5 text-xs text-white/40">
                💡 {current.tip}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-white/40 transition hover:text-white/70 disabled:opacity-0"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                <button
                  onClick={() => isLast ? onComplete() : setStep((s) => s + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple px-5 py-2 text-sm font-medium text-white transition hover:brightness-110"
                >
                  {isLast ? (
                    <><Check size={15} /> Get Started</>
                  ) : (
                    <>Next <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onComplete}
          className="mt-4 w-full text-center text-xs text-white/20 hover:text-white/40 transition"
        >
          Skip tutorial
        </button>
      </div>
    </motion.div>
  );
}
