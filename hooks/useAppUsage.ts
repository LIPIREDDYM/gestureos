import { create } from "zustand";
import type { AppId } from "@/types/window";

interface UsageStore {
  // ms spent per appId
  usage: Partial<Record<AppId, number>>;
  tick: (appId: AppId, ms: number) => void;
  reset: () => void;
}

export const useAppUsage = create<UsageStore>((set) => ({
  usage: {},
  tick: (appId, ms) =>
    set((s) => ({ usage: { ...s.usage, [appId]: (s.usage[appId] ?? 0) + ms } })),
  reset: () => set({ usage: {} }),
}));
