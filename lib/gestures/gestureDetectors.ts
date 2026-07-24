import { LandmarkIndex, type HandFrame, type Landmark } from "@/types/hand";
import { distance2D, distance3D } from "@/utils/math";

/**
 * Each detector inspects a single HandFrame and returns a confidence score
 * in [0, 1] for "how much does this frame look like gesture X". The
 * recognizer (hooks/useGestureRecognition.ts) picks the highest-confidence
 * static gesture per frame, and separately tracks fingertip motion across
 * frames to detect swipes (which are temporal, not a single-frame shape).
 */

/** Whether a given finger is "extended" (straight) vs "curled" (folded into the palm). */
function fingerExtension(
  landmarks: Landmark[],
  mcp: LandmarkIndex,
  pip: LandmarkIndex,
  tip: LandmarkIndex,
  wrist: Landmark
): number {
  // A finger is extended when its tip is meaningfully farther from the wrist
  // than its middle joint is. Using distance ratios (rather than raw y
  // comparisons) keeps this robust to hand rotation.
  const tipDist = distance2D(landmarks[tip], wrist);
  const pipDist = distance2D(landmarks[pip], wrist);
  const mcpDist = distance2D(landmarks[mcp], wrist);
  if (pipDist <= 0) return 0;
  const ratio = (tipDist - mcpDist) / (pipDist - mcpDist + 1e-6);
  // ratio > ~1.1 => finger reaches well past its base knuckle => extended
  return clampConfidence((ratio - 0.6) / 0.9);
}

function clampConfidence(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function thumbExtension(landmarks: Landmark[]): number {
  const wrist = landmarks[LandmarkIndex.WRIST];
  const tip = landmarks[LandmarkIndex.THUMB_TIP];
  const mcp = landmarks[LandmarkIndex.THUMB_MCP];
  const indexMcp = landmarks[LandmarkIndex.INDEX_MCP];
  // Thumb "extension" is best measured by how far the tip strays from the
  // palm's central axis (index MCP), rather than from the wrist, since the
  // thumb's own MCP-to-tip vector is short and rotates a lot.
  const spread = distance2D(tip, indexMcp);
  const base = distance2D(mcp, indexMcp);
  if (base <= 0) return 0;
  return clampConfidence((spread / base - 0.8) / 0.9);
}

export interface FingerState {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export function getFingerState(frame: HandFrame): FingerState {
  const lm = frame.landmarks;
  const wrist = lm[LandmarkIndex.WRIST];
  return {
    thumb: thumbExtension(lm),
    index: fingerExtension(lm, LandmarkIndex.INDEX_MCP, LandmarkIndex.INDEX_PIP, LandmarkIndex.INDEX_TIP, wrist),
    middle: fingerExtension(lm, LandmarkIndex.MIDDLE_MCP, LandmarkIndex.MIDDLE_PIP, LandmarkIndex.MIDDLE_TIP, wrist),
    ring: fingerExtension(lm, LandmarkIndex.RING_MCP, LandmarkIndex.RING_PIP, LandmarkIndex.RING_TIP, wrist),
    pinky: fingerExtension(lm, LandmarkIndex.PINKY_MCP, LandmarkIndex.PINKY_PIP, LandmarkIndex.PINKY_TIP, wrist),
  };
}

/** Open Palm: all five fingers extended. */
export function detectOpenPalm(fingers: FingerState): number {
  const extended = [fingers.thumb, fingers.index, fingers.middle, fingers.ring, fingers.pinky];
  const avg = extended.reduce((a, b) => a + b, 0) / extended.length;
  const min = Math.min(...extended);
  // Require every finger to be reasonably extended, weighted toward the worst finger
  return clampConfidence(avg * 0.4 + min * 0.6);
}

/** Fist: all five fingers curled. */
export function detectFist(fingers: FingerState): number {
  const curled = [fingers.thumb, fingers.index, fingers.middle, fingers.ring, fingers.pinky].map((v) => 1 - v);
  const avg = curled.reduce((a, b) => a + b, 0) / curled.length;
  const min = Math.min(...curled);
  return clampConfidence(avg * 0.5 + min * 0.5);
}

/** Pinch: thumb tip and index tip very close together, other fingers relatively curled. */
export function detectPinch(frame: HandFrame, fingers: FingerState, pinchThreshold: number): number {
  const lm = frame.landmarks;
  const d = distance3D(lm[LandmarkIndex.THUMB_TIP], lm[LandmarkIndex.INDEX_TIP]);
  const proximity = clampConfidence((pinchThreshold - d) / pinchThreshold);
  // Middle/ring/pinky being curled disambiguates pinch from an open-hand
  // "ok sign"-adjacent pose and reduces false positives while typing etc.
  const othersCurled = clampConfidence(1 - (fingers.middle + fingers.ring + fingers.pinky) / 3);
  return clampConfidence(proximity * 0.75 + othersCurled * 0.25);
}

/** Thumbs Up: thumb extended and pointing upward, all other fingers curled into a fist. */
export function detectThumbsUp(frame: HandFrame, fingers: FingerState): number {
  const lm = frame.landmarks;
  const wrist = lm[LandmarkIndex.WRIST];
  const tip = lm[LandmarkIndex.THUMB_TIP];
  const othersCurled = clampConfidence(1 - (fingers.index + fingers.middle + fingers.ring + fingers.pinky) / 4);
  // "Pointing up" means the thumb tip sits well above the wrist in image
  // space (remember image y grows downward).
  const verticalness = clampConfidence((wrist.y - tip.y) * 4);
  const thumbOut = clampConfidence(fingers.thumb);
  return clampConfidence(othersCurled * 0.45 + verticalness * 0.35 + thumbOut * 0.2);
}

/** Peace Sign: index + middle extended, forming a V, ring + pinky curled. */
export function detectPeaceSign(frame: HandFrame, fingers: FingerState): number {
  const lm = frame.landmarks;
  const extendedScore = clampConfidence((fingers.index + fingers.middle) / 2);
  const curledScore = clampConfidence(1 - (fingers.ring + fingers.pinky) / 2);
  // The V-shape: index and middle tips should be spread apart relative to
  // their base knuckles, distinguishing "peace" from two parallel fingers.
  const spread = distance2D(lm[LandmarkIndex.INDEX_TIP], lm[LandmarkIndex.MIDDLE_TIP]);
  const baseSpread = distance2D(lm[LandmarkIndex.INDEX_MCP], lm[LandmarkIndex.MIDDLE_MCP]);
  const vShape = clampConfidence((spread / (baseSpread + 1e-6) - 1.1) / 1.2);
  return clampConfidence(extendedScore * 0.45 + curledScore * 0.35 + vShape * 0.2);
}
