import { create } from "zustand";
import type { AppId, WindowInstance } from "@/types/window";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";

interface WindowManagerState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  isLauncherOpen: boolean;
  currentPageIndex: number; // for swipe left/right "virtual desktop" paging
  openApp: (appId: AppId) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  toggleMaximize: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  setLauncherOpen: (open: boolean) => void;
  toggleLauncher: () => void;
  nextPage: () => void;
  prevPage: () => void;
}

let zCounter = 10;
let idCounter = 0;

function cascadeOffset() {
  const offset = (idCounter % 6) * 28;
  return { x: 160 + offset, y: 110 + offset };
}

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  isLauncherOpen: false,
  currentPageIndex: 0,

  openApp: (appId) => {
    const def = APP_REGISTRY.find((a) => a.id === appId);
    if (!def) return;

    const existing = get().windows.find((w) => w.appId === appId && !w.isMinimized);
    if (existing) {
      get().focusWindow(existing.windowId);
      set({ isLauncherOpen: false });
      return;
    }

    const minimizedExisting = get().windows.find((w) => w.appId === appId);
    if (minimizedExisting) {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.windowId === minimizedExisting.windowId
            ? { ...w, isMinimized: false, zIndex: ++zCounter }
            : w
        ),
        activeWindowId: minimizedExisting.windowId,
        isLauncherOpen: false,
      }));
      return;
    }

    idCounter += 1;
    const pos = cascadeOffset();
    const newWindow: WindowInstance = {
      windowId: `${appId}-${idCounter}`,
      appId,
      title: def.title,
      x: pos.x,
      y: pos.y,
      width: def.defaultSize.width,
      height: def.defaultSize.height,
      zIndex: ++zCounter,
      isMinimized: false,
      isMaximized: false,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.windowId,
      isLauncherOpen: false,
    }));
  },

  closeWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.windowId !== windowId),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
  },

  focusWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.windowId === windowId ? { ...w, zIndex: ++zCounter } : w
      ),
      activeWindowId: windowId,
    }));
  },

  minimizeWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.windowId === windowId ? { ...w, isMinimized: true } : w
      ),
    }));
  },

  toggleMaximize: (windowId) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.windowId !== windowId) return w;
        if (w.isMaximized) {
          const prev = w.prevBounds ?? { x: 160, y: 110, width: w.width, height: w.height };
          return { ...w, isMaximized: false, ...prev };
        }
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
        };
      }),
    }));
  },

  moveWindow: (windowId, x, y) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.windowId === windowId ? { ...w, x, y } : w)),
    }));
  },

  resizeWindow: (windowId, width, height) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.windowId === windowId ? { ...w, width, height } : w)),
    }));
  },

  setLauncherOpen: (open) => set({ isLauncherOpen: open }),
  toggleLauncher: () => set((state) => ({ isLauncherOpen: !state.isLauncherOpen })),

  nextPage: () => set((state) => ({ currentPageIndex: Math.min(state.currentPageIndex + 1, 2) })),
  prevPage: () => set((state) => ({ currentPageIndex: Math.max(state.currentPageIndex - 1, 0) })),
}));
