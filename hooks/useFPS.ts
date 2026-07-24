import { useCallback, useRef, useState } from "react";

/**
 * Tracks frames-per-second by having the caller invoke `tick()` once per
 * processed video frame. We average over a rolling 500ms window rather than
 * naively doing 1000/deltaTime, which keeps the displayed number stable
 * instead of jittering wildly frame to frame.
 */
export function useFPS() {
  const [fps, setFps] = useState(0);
  const frameTimes = useRef<number[]>([]);

  const tick = useCallback(() => {
    const now = performance.now();
    const times = frameTimes.current;
    times.push(now);
    while (times.length > 0 && now - times[0] > 500) {
      times.shift();
    }
    if (times.length >= 2) {
      const windowSeconds = (now - times[0]) / 1000;
      setFps(Math.round((times.length - 1) / windowSeconds));
    }
  }, []);

  return { fps, tick };
}
