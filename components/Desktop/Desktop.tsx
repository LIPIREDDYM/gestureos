"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, ShieldAlert, Sparkles as SparklesIcon, HelpCircle, X } from "lucide-react";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useNotifications } from "@/hooks/useNotifications";
import { useSettings } from "@/hooks/useSettings";
import type { GestureEvent } from "@/types/gesture";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Launcher } from "./Launcher";
import { Spotlight } from "./Spotlight";
import { NotificationCenter } from "./NotificationCenter";
import { BootScreen } from "./BootScreen";
import { Onboarding } from "./Onboarding";
import { WindowManager } from "@/components/Windows/WindowManager";
import { CameraFeed } from "@/components/Gesture/CameraFeed";
import { GestureHUD } from "@/components/Gesture/GestureHUD";
import { GestureCursor } from "@/components/Gesture/GestureCursor";
import { GlassPanel } from "@/components/UI/GlassPanel";

const GESTURE_GUIDE = [
  { gesture: "✋ Open Palm", action: "Launcher" },
  { gesture: "🤏 Pinch", action: "Click" },
  { gesture: "✌️ Peace Sign", action: "Spotlight" },
  { gesture: "👊 Fist", action: "Close window" },
  { gesture: "👍 Thumbs Up", action: "Save" },
  { gesture: "👈 Swipe Left", action: "Prev page" },
  { gesture: "👉 Swipe Right", action: "Next page" },
];

// Tiny Web Audio beeps — no external files needed
function playSound(type: "click" | "open" | "close" | "notify") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const configs = {
      click: { freq: 880, duration: 0.06, volume: 0.08 },
      open: { freq: 440, duration: 0.12, volume: 0.07 },
      close: { freq: 220, duration: 0.1, volume: 0.06 },
      notify: { freq: 660, duration: 0.15, volume: 0.07 },
    };
    const c = configs[type];
    osc.frequency.value = c.freq;
    gain.gain.setValueAtTime(c.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + c.duration);
  } catch { /* Audio not available */ }
}

export function Desktop() {
  // Boot + onboarding
  const [booted, setBooted] = useState(false);
  const [onboarded, setOnboarded] = useState(() => {
    try { return localStorage.getItem("gestureos:onboarded") === "1"; } catch { return false; }
  });

  const [gestureControlEnabled, setGestureControlEnabled] = useState(false);
  const [cameraMinimized, setCameraMinimized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPinchingRef = useRef(false);
  const pinchCursorRef = useRef<{ x: number; y: number } | null>(null);

  const settings = useSettings();
  const { push: pushNotification } = useNotifications();

  const { videoRef, cameraStatus, currentFrame, fps, errorMessage } = useHandTracking({
    enabled: gestureControlEnabled,
    modelComplexity: settings.modelComplexity,
    cameraResolution: settings.cameraResolution,
  });

  const { openApp, toggleLauncher, setLauncherOpen, nextPage, prevPage, closeWindow } =
    useWindowManager();

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const handleGesture = useCallback(
    (event: GestureEvent) => {
      if (settings.soundEnabled) playSound("click");

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
        case "peace_sign":
          setSpotlightOpen((v) => !v);
          showToast("🔍 Spotlight");
          break;
        case "fist": {
          const id = useWindowManager.getState().activeWindowId;
          if (id) {
            closeWindow(id);
            showToast("✕ Closed");
            if (settings.soundEnabled) playSound("close");
          }
          break;
        }
        case "thumbs_up":
          window.dispatchEvent(new CustomEvent("gestureos:thumbsup"));
          // Also trigger Mission Control if no windows open
          if (useWindowManager.getState().windows.length === 0) {
            window.dispatchEvent(new CustomEvent("gestureos:missioncontrol"));
          }
          showToast("✓ Saved");
          break;
        default:
          break;
      }
    },
    [toggleLauncher, setLauncherOpen, prevPage, nextPage, showToast, closeWindow, settings.soundEnabled]
  );

  const { gesture, cursor } = useGestureRecognition({
    frame: currentFrame,
    onGesture: handleGesture,
    config: { minConfidence: settings.gestureSensitivity },
  });

  const isPinching = gesture.type === "pinch" && gesture.confidence > 0.7;

  useEffect(() => { pinchCursorRef.current = cursor; });

  useEffect(() => {
    if (isPinching && !wasPinchingRef.current) {
      const cur = pinchCursorRef.current;
      if (cur) {
        const screenX = (1 - cur.x) * window.innerWidth;
        const screenY = cur.y * window.innerHeight;
        const target = document.elementFromPoint(screenX, screenY) as HTMLElement | null;
        target?.click();
        if (settings.soundEnabled) playSound("click");
      }
    }
    wasPinchingRef.current = isPinching;
  }, [isPinching, settings.soundEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        setSpotlightOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        toggleLauncher();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleLauncher]);

  // Push a welcome notification after boot
  useEffect(() => {
    if (booted) {
      setTimeout(() => {
        pushNotification({
          title: "Welcome to GestureOS",
          body: "Enable gesture control to start using hand gestures.",
          icon: "✋",
        });
      }, 1500);
    }
  }, [booted, pushNotification]);

  // Notify when gesture control connects
  useEffect(() => {
    if (cameraStatus === "streaming") {
      pushNotification({ title: "Camera connected", body: "Hand tracking is now active.", icon: "📷" });
      if (settings.soundEnabled) playSound("notify");
    }
  }, [cameraStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeOnboarding = () => {
    setOnboarded(true);
    try { localStorage.setItem("gestureos:onboarded", "1"); } catch { /* ignore */ }
  };

  if (!booted) return <BootScreen onComplete={() => setBooted(true)} />;
  if (!onboarded) return <Onboarding onComplete={completeOnboarding} />;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Wallpaper theme={settings.wallpaperTheme} />
      <MenuBar onSpotlight={() => setSpotlightOpen((v) => !v)} />
      <WindowManager />
      <Launcher />
      <Dock />
      <NotificationCenter />
      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />

      {gestureControlEnabled && (
        <>
          {settings.showFPS && (
            <GestureHUD gesture={gesture} cameraStatus={cameraStatus} fps={fps} handDetected={!!currentFrame} />
          )}
          <GestureCursor cursor={gesture.cursor} isPinching={isPinching} visible={cameraStatus === "streaming"} />
          <CameraFeed
            videoRef={videoRef}
            frame={currentFrame}
            cameraStatus={cameraStatus}
            minimized={cameraMinimized}
            onToggleMinimize={() => setCameraMinimized((m) => !m)}
          />

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
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="fixed bottom-36 left-6 z-50"
              >
                <GlassPanel strong className="w-56 rounded-2xl p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">Gestures</p>
                  <div className="space-y-2">
                    {GESTURE_GUIDE.map(({ gesture: g, action }) => (
                      <div key={g} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-white/80">{g}</span>
                        <span className="text-white/40">{action}</span>
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
