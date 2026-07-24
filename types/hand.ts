/**
 * A single normalized landmark returned by MediaPipe Hands.
 * x, y are normalized to [0, 1] relative to the video frame (origin top-left).
 * z is depth, roughly relative to the wrist, negative = closer to camera.
 */
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/** The 21 canonical MediaPipe hand landmark indices, named for readability. */
export enum LandmarkIndex {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_MCP = 5,
  INDEX_PIP = 6,
  INDEX_DIP = 7,
  INDEX_TIP = 8,
  MIDDLE_MCP = 9,
  MIDDLE_PIP = 10,
  MIDDLE_DIP = 11,
  MIDDLE_TIP = 12,
  RING_MCP = 13,
  RING_PIP = 14,
  RING_DIP = 15,
  RING_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,
}

export type Handedness = "Left" | "Right";

export interface HandFrame {
  landmarks: Landmark[];
  handedness: Handedness;
  score: number; // detection confidence [0,1]
  timestamp: number; // performance.now() at capture
}

export type CameraStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error"
  | "streaming";

export interface TrackingStats {
  fps: number;
  latencyMs: number;
}
