import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraStatus, HandFrame } from "@/types/hand";
import { loadHands, toHandFrame, type MpHandsInstance } from "@/lib/mediapipe/handsSetup";
import { useFPS } from "./useFPS";

const RES_MAP = {
  "480p": { width: 640, height: 480 },
  "720p": { width: 960, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};

interface UseHandTrackingOptions {
  enabled: boolean;
  modelComplexity?: 0 | 1;
  cameraResolution?: "480p" | "720p" | "1080p";
}

interface UseHandTrackingReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  currentFrame: HandFrame | null;
  fps: number;
  errorMessage: string | null;
}

export function useHandTracking({
  enabled,
  modelComplexity = 0,
  cameraResolution = "720p",
}: UseHandTrackingOptions): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<MpHandsInstance | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [currentFrame, setCurrentFrame] = useState<HandFrame | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { fps, tick } = useFPS();
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
    const res = RES_MAP[cameraResolution];

    async function start() {
      try {
        setCameraStatus("requesting");
        setErrorMessage(null);

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser doesn't support camera access.");
        }

        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: res.width, height: res.height, facingMode: "user" },
          audio: false,
        });
        if (cancelledRef.current) { localStream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = localStream;
        setCameraStatus("granted");

        const video = videoRef.current;
        if (!video) throw new Error("Video element not mounted.");
        video.srcObject = localStream;
        await video.play();

        // Pass modelComplexity so it actually takes effect
        const hands = await loadHands(modelComplexity);
        if (cancelledRef.current) return;
        handsRef.current = hands;

        hands.onResults((results) => {
          const frame = toHandFrame(results);
          setCurrentFrame(frame);
          tickRef.current();
        });

        setCameraStatus("streaming");

        let busyRef = false;
        let lastFrameTime = 0;
        const TARGET_INTERVAL_MS = 1000 / 30;

        const loop = async (timestamp: number) => {
          if (cancelledRef.current || !handsRef.current || !videoRef.current) return;
          const elapsed = timestamp - lastFrameTime;
          if (!busyRef && elapsed >= TARGET_INTERVAL_MS) {
            lastFrameTime = timestamp;
            busyRef = true;
            try { await handsRef.current.send({ image: videoRef.current }); } catch { /* skip */ }
            finally { busyRef = false; }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelledRef.current) return;
        const message = err instanceof Error ? err.message : "Unknown camera error.";
        const isPermissionError = err instanceof DOMException &&
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
  }, [enabled, modelComplexity, cameraResolution]);

  return { videoRef, cameraStatus, currentFrame, fps, errorMessage };
}
