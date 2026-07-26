import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraStatus, HandFrame } from "@/types/hand";
import { loadHands, toHandFrame, type MpHandsInstance } from "@/lib/mediapipe/handsSetup";
import { useFPS } from "./useFPS";

interface UseHandTrackingOptions {
  /** Master on/off switch, e.g. tied to a "camera enabled" toggle in the UI. */
  enabled: boolean;
}

interface UseHandTrackingReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  currentFrame: HandFrame | null;
  fps: number;
  errorMessage: string | null;
}

/**
 * Owns the full pipeline: webcam -> MediaPipe Hands -> normalized HandFrame.
 * Exposes the latest frame as state so downstream hooks/components can
 * derive gestures and render overlays from it.
 */
export function useHandTracking({ enabled }: UseHandTrackingOptions): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<MpHandsInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [currentFrame, setCurrentFrame] = useState<HandFrame | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fps, tick } = useFPS();
  // Keep tick in a ref so the onResults callback never needs to be
  // re-registered when tick's identity changes between renders.
  const tickRef = useRef(tick);
  useEffect(() => { tickRef.current = tick; });

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    handsRef.current?.close();
    handsRef.current = null;
    setCurrentFrame(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      setCameraStatus("idle");
      return;
    }

    cancelledRef.current = false;
    let localStream: MediaStream | null = null;

    async function start() {
      try {
        setCameraStatus("requesting");
        setErrorMessage(null);

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser doesn't support camera access.");
        }

        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 960, height: 720, facingMode: "user" },
          audio: false,
        });
        if (cancelledRef.current) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = localStream;
        setCameraStatus("granted");

        const video = videoRef.current;
        if (!video) throw new Error("Video element not mounted.");
        video.srcObject = localStream;
        await video.play();

        const hands = await loadHands();
        if (cancelledRef.current) return;
        handsRef.current = hands;

        hands.onResults((results) => {
          const frame = toHandFrame(results);
          setCurrentFrame(frame);
          tickRef.current();
        });

        setCameraStatus("streaming");

        // Cap at ~30 fps by skipping frames when MediaPipe is still
        // processing. Without this, frames pile up in the microtask queue
        // and the pipeline gets progressively laggier over time.
        let busyRef = false;
        let lastFrameTime = 0;
        const TARGET_INTERVAL_MS = 1000 / 30; // ~33 ms per frame

        const loop = async (timestamp: number) => {
          if (cancelledRef.current || !handsRef.current || !videoRef.current) return;

          const elapsed = timestamp - lastFrameTime;
          if (!busyRef && elapsed >= TARGET_INTERVAL_MS) {
            lastFrameTime = timestamp;
            busyRef = true;
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch {
              // Transient send failures (e.g. during teardown) are safe to skip.
            } finally {
              busyRef = false;
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelledRef.current) return;
        const message = err instanceof Error ? err.message : "Unknown camera error.";
        const isPermissionError =
          err instanceof DOMException &&
          (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
        setCameraStatus(isPermissionError ? "denied" : "error");
        setErrorMessage(message);
      }
    }

    start();

    return () => {
      cancelledRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      localStream?.getTracks().forEach((t) => t.stop());
      handsRef.current?.close();
      handsRef.current = null;
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { videoRef, cameraStatus, currentFrame, fps, errorMessage };
}
