import { create } from "zustand";
import type { GestureType } from "@/types/gesture";

export interface GestureHistoryEntry {
  type: GestureType;
  confidence: number;
  timestamp: number;
}

interface GestureHistoryStore {
  history: GestureHistoryEntry[];
  push: (entry: GestureHistoryEntry) => void;
  clear: () => void;
}

export const useGestureHistory = create<GestureHistoryStore>((set) => ({
  history: [],
  push: (entry) =>
    set((s) => ({
      history: [entry, ...s.history].slice(0, 30),
    })),
  clear: () => set({ history: [] }),
}));
