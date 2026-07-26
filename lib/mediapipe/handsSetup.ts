import type { HandFrame } from "@/types/hand";

/**
 * MediaPipe's `@mediapipe/hands` npm package is a UMD bundle. When imported
 * through webpack/ESM (`import { Hands } from "@mediapipe/hands"`), the
 * named export sometimes doesn't resolve to an actual constructor
 * ("Hands is not a constructor") because of how the UMD wrapper interops
 * with different bundlers/module systems.
 *
 * The reliable fix — and what MediaPipe's own docs/demos do — is to load
 * the library via a plain <script> tag from the CDN so it attaches itself
 * to `window.Hands` exactly as it was built to, then read it off `window`.
 * This also lets it fetch its .wasm/.tflite assets via `locateFile` from
 * the same CDN at runtime.
 */

declare global {
  interface Window {
    Hands?: new (config: { locateFile: (file: string) => string }) => MpHandsInstance;
  }
}

// Minimal structural typing for the parts of the MediaPipe API we use, since
// @mediapipe/hands ships without first-class TS types for this shape.
export interface MpHandsResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
  multiHandedness?: Array<{ label: "Left" | "Right"; score: number }>;
}

export interface MpHandsInstance {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (cb: (results: MpHandsResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

const HANDS_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";

let scriptPromise: Promise<void> | null = null;

/** Injects the MediaPipe Hands UMD script exactly once and waits for it to attach `window.Hands`. */
function loadHandsScript(): Promise<void> {
  if (window.Hands) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${HANDS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load MediaPipe Hands script.")));
      return;
    }
    const script = document.createElement("script");
    script.src = HANDS_SCRIPT_URL;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MediaPipe Hands script from CDN. Check your internet connection or firewall/VPN settings."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

let handsPromise: Promise<MpHandsInstance> | null = null;

export async function loadHands(): Promise<MpHandsInstance> {
  if (handsPromise) return handsPromise;

  handsPromise = (async () => {
    await loadHandsScript();

    const HandsCtor = window.Hands;
    if (!HandsCtor) {
      throw new Error("MediaPipe Hands failed to initialize (window.Hands missing after script load).");
    }

    const hands = new HandsCtor({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      // Use the lite model (0) for dramatically better performance on most
      // hardware. The full model (1) is more accurate but unnecessary for
      // the 7-gesture set we recognise, and it competes with the rest of
      // the UI for GPU/CPU resources.
      modelComplexity: 0,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.55,
    });

    return hands;
  })();

  // If setup fails, clear the cached promise so a retry (e.g. re-clicking
  // "Enable Gesture Control") can attempt the whole flow again.
  handsPromise.catch(() => {
    handsPromise = null;
  });

  return handsPromise;
}

/** Convert a raw MediaPipe result into our normalized HandFrame shape. */
export function toHandFrame(results: MpHandsResults): HandFrame | null {
  const landmarks = results.multiHandLandmarks?.[0];
  const handedness = results.multiHandedness?.[0];
  if (!landmarks || !handedness) return null;

  return {
    landmarks: landmarks.map((l) => ({ x: l.x, y: l.y, z: l.z })),
    handedness: handedness.label,
    score: handedness.score,
    timestamp: performance.now(),
  };
}
