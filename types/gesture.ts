export type GestureType =
  | "none"
  | "open_palm"
  | "pinch"
  | "swipe_left"
  | "swipe_right"
  | "thumbs_up"
  | "peace_sign"
  | "fist";

export interface GestureEvent {
  type: GestureType;
  confidence: number; // [0,1]
  timestamp: number;
  /** Normalized cursor position derived from the index fingertip, used for pointer control. */
  cursor: { x: number; y: number } | null;
}

export interface GestureConfig {
  /** Minimum confidence required before a gesture is emitted. */
  minConfidence: number;
  /** Cooldown (ms) after a discrete gesture (swipe / thumbs up / peace) fires, to avoid repeats. */
  cooldownMs: number;
  /** Distance threshold (normalized) below which thumb+index counts as a pinch. */
  pinchThreshold: number;
  /** Minimum normalized horizontal travel to count as a swipe. */
  swipeThreshold: number;
  /** Max time window (ms) for a swipe gesture to complete. */
  swipeWindowMs: number;
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  minConfidence: 0.62,
  cooldownMs: 750,
  pinchThreshold: 0.06,
  swipeThreshold: 0.18,
  swipeWindowMs: 700,
};
