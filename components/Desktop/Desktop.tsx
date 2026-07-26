"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, ShieldAlert, Sparkles as SparklesIcon, HelpCircle, X } from "lucide-react";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import { useWindowManager } from "@/hooks/useWindowManager";
import type { GestureEvent } from "@/types/gesture";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Launcher } from "./Launcher";
import { WindowManager } from "@/components/Windows/WindowManager";
import { CameraFeed } from "@/components/Gesture/CameraFeed";
import { GestureHUD } from "@/components/Gesture/GestureHUD";
import { GestureCursor } from "@/components/Gesture/GestureCursor";
import { GlassPanel } from "@/components/UI/GlassPanel";

const GESTURE_GUIDE = [
  { gesture: "✋ Open Palm", action: "Open / close launcher" },
  { gesture: "🤏 Pinch", action: "Click anything" },
  { gesture: "✌️ Peace Sign", action: "Open AI Assistant" },
  { gesture: "👊 Fist", action: "Close active window" },
  { gesture: "👍 Thumbs Up", action: "Save note" },
  { gesture: "👈 Swipe Left", action: "Previous page" },
  { gesture: "👉 Swipe Right", action: "Next page" },
];

export function Desktop() {
  const [gestureControlEnabled, setGestureControlEnabled] = useState(false);
  const [cameraMinimized, setCameraMinimized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPinchingRef = useRef(false);
  const pinchCursorRef = useRef<{ x: number; y: number } | null>(null);

  const { videoRef, cameraStatus, currentFrame, fps, errorMessage } = useHandTracking({
    enabled: gestureControlEnabled,
  });

  const { openApp, toggleLauncher, setLauncherOpen, nextPage, prevPage, activeWindowId, closeWindow } =
    useWindowManager();

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const handleGesture = useCallback(
    (event: GestureEvent) => {
      switch (event.type) {
        case "open_palm":
          toggleLauncher();
          break;
        case "swipe_left":
          setLauncherOpen(false);
          prevPage();
          showToast("◀ Previous");
          break;
        case "swipe_right":
          setLauncherOpen(false);
          nextPage();
          showToast("Next ▶");
          break;
        case "thumbs_up": {
          // Dispatch a custom DOM event so the focused app can react to it
          // (e.g. Notes listens and triggers a visual save confirmation).
          window.dispatchEvent(new CustomEvent("gestureos:thumbsup"));
          showToast("✓ Saved");
          break;
        }
        case "peace_sign":
          openApp("assistant");
          showToast("✨ Assistant opened");
          break;
        case "fist": {
          const id = useWindowManager.getState().activeWindowId;
          if (id) {
            closeWindow(id);
            showToast("✕ Window closed");
          }
          break;
        }
        default:
          break;
      }
    },
    [toggleLauncher, setLauncherOpen, prevPage, nextPage, openApp, showToast, closeWindow]
  );

  const { gesture, cursor } = useGestureRecognition({ frame: currentFrame, onGesture: handleGesture });

  const isPinching = gesture.type === "pinch" && gesture.confidence > 0.7;

  // Keep a ref to the latest cursor so the effect below can read it without
  // being in the dependency array (we only want to fire on pinch edge).
  useEffect(() => {
    pinchCursorRef.current = cursor;
  });

  // Pinch-to-click: fire on the rising edge of a pinch. Doing this in an
  // effect (not in render) avoids the side-effect-in-render anti-pattern.
  useEffect(() => {
    if (isPinching && !wasPinchingRef.current) {
      const cur = pinchCursorRef.current;
      if (cur) {
        const screenX = (1 - cur.x) * window.innerWidth;
        const screenY = cur.y * window.innerHeight;
        const target = document.elementFromPoint(screenX, screenY) as HTMLElement | null;
        target?.click();
      }
    }
    wasPinchingRef.current = isPinching;
  }, [isPinching]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <WindowManager />
      <Launcher />
      <Dock />

      {gestureControlEnabled && (
        <>
          <GestureHUD gesture={gesture} cameraStatus={cameraStatus} fps={fps} handDetected={!!currentFrame} />
          <GestureCursor cursor={gesture.cursor} isPinching={isPinching} visible={cameraStatus === "streaming"} />
          <CameraFeed
            videoRef={videoRef}
            frame={currentFrame}
            cameraStatus={cameraStatus}
            minimized={cameraMinimized}
            onToggleMinimize={() => setCameraMinimized((m) => !m)}
          />

          {/* Gesture guide toggle */}
          <button
            onClick={() => setShowGuide((v) => !v)}
            className="fixed bottom-24 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            aria-label="Gesture guide"
          >
            {showGuide ? <X size={16} /> : <HelpCircle size={16} />}
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, x: -12, y: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="fixed bottom-36 left-6 z-50"
              >
                <GlassPanel strong className="w-64 rounded-2xl p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                    Gesture Reference
                  </p>
                  <div className="space-y-2">
                    {GESTURE_GUIDE.map(({ gesture: g, action }) => (
                      <div key={g} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-white/80">{g}</span>
                        <span className="text-right text-white/40">{action}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {!gestureControlEnabled && (
        <div className="fixed bottom-24 right-6 z-50">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setGestureControlEnabled(true)}
            className="flex items-center gap-2 rounded-full bg-aurora px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
          >
            <Hand size={16} />
            Enable Gesture Control
          </motion.button>
        </div>
      )}

      {gestureControlEnabled && (cameraStatus === "denied" || cameraStatus === "error") && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <GlassPanel strong className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
            <ShieldAlert size={18} className="text-accent-pink" />
            <div>
              <p className="font-medium text-white/90">
                {cameraStatus === "denied" ? "Camera access denied" : "Camera error"}
              </p>
              <p className="text-xs text-white/50">
                {errorMessage ?? "Check your browser's site permissions and try again."}
              </p>
            </div>
            <button
              onClick={() => setGestureControlEnabled(false)}
              className="ml-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
            >
              Dismiss
            </button>
          </GlassPanel>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="fixed left-1/2 top-6 z-[90] -translate-x-1/2"
          >
            <GlassPanel strong className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <SparklesIcon size={14} className="text-accent-purple" />
              {toast}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
