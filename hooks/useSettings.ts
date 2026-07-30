import { create } from "zustand";

export type WallpaperTheme = "space" | "cyberpunk" | "forest" | "ocean";

export interface Settings {
  gestureSensitivity: number;      // 0.4 – 0.9 (maps to minConfidence)
  modelComplexity: 0 | 1;          // 0 = lite, 1 = full
  cameraResolution: "720p" | "480p" | "1080p";
  wallpaperTheme: WallpaperTheme;
  soundEnabled: boolean;
  showFPS: boolean;
  dwellTime: number;               // ms for dwell-to-select (600 – 2000)
}

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const DEFAULTS: Settings = {
  gestureSensitivity: 0.62,
  modelComplexity: 0,
  cameraResolution: "720p",
  wallpaperTheme: "space",
  soundEnabled: true,
  showFPS: true,
  dwellTime: 1200,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem("gestureos:settings");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULTS;
}

export const useSettings = create<SettingsStore>((set) => ({
  ...load(),
  update: (patch) => {
    set((s) => {
      const next = { ...s, ...patch };
      try { localStorage.setItem("gestureos:settings", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  },
  reset: () => {
    set(DEFAULTS);
    try { localStorage.removeItem("gestureos:settings"); } catch { /* ignore */ }
  },
}));
