import type { Landmark } from "@/types/hand";

/** Euclidean distance between two normalized landmarks (ignores z by default). */
export function distance2D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** 3D Euclidean distance, useful for pinch detection where depth matters. */
export function distance3D(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Remap a value from one range to another, clamped. */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
}

/** Simple exponential moving average smoother for jitter-prone cursor input. */
export class EmaSmoother {
  private value: number | null = null;
  constructor(private alpha: number = 0.35) {}

  next(sample: number): number {
    this.value = this.value === null ? sample : this.value + this.alpha * (sample - this.value);
    return this.value;
  }

  reset() {
    this.value = null;
  }
}
