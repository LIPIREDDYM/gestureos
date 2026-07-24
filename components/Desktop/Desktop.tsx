"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, ShieldAlert, Sparkles as SparklesIcon } from "lucide-react";
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

export function Desktop() {
  const [gestureControlEnabled, setGestureControlEnabled] = useState(false);
  const [cameraMinimized, setCameraMinimized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPinchingRef = useRef(false);

  const { videoRef, cameraStatus, currentFrame, fps, errorMessage } = useHandTracking({
    enabled: gestureControlEnabled,
  });

  const { openApp, toggleLauncher, setLauncherOpen, nextPage, prevPage } = useWindowManager();

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
        case "thumbs_up":
          showToast("✓ Saved");
          break;
        case "peace_sign":
          openApp("assistant");
          showToast("✨ Assistant opened");
          break;
        default:
          break;
      }
    },
    [toggleLauncher, setLauncherOpen, prevPage, nextPage, openApp, showToast]
  );

  const { gesture, cursor } = useGestureRecognition({ frame: currentFrame, onGesture: handleGesture });

  // Pinch acts like a mouse click: on the rising edge of a pinch, translate
  // the smoothed cursor position into real screen coordinates and simulate
  // a native click there, so pinching over a dock icon or button "just works".
  const isPinching = gesture.type === "pinch" && gesture.confidence > 0.7;
  if (isPinching && !wasPinchingRef.current && cursor) {
    const screenX = (1 - cursor.x) * window.innerWidth;
    const screenY = cursor.y * window.innerHeight;
    const target = document.elementFromPoint(screenX, screenY) as HTMLElement | null;
    target?.click();
  }
  wasPinchingRef.current = isPinching;

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
