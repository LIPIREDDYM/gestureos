"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowManager } from "@/hooks/useWindowManager";
import { Window } from "./Window";

const TOTAL_PAGES = 3;

function tileWindows() {
  const { windows, moveWindow, resizeWindow } = useWindowManager.getState();
  const visible = windows.filter((w) => !w.isMinimized && !w.isMaximized);
  if (visible.length === 0) return;

  const sw = window.innerWidth;
  const sh = window.innerHeight - 100; // leave room for dock + menubar
  const top = 44;

  if (visible.length === 1) {
    moveWindow(visible[0].windowId, 20, top + 10);
    resizeWindow(visible[0].windowId, sw - 40, sh - 20);
    return;
  }
  if (visible.length === 2) {
    const w = Math.floor(sw / 2) - 12;
    visible.forEach((win, i) => {
      moveWindow(win.windowId, i === 0 ? 8 : sw / 2 + 4, top + 8);
      resizeWindow(win.windowId, w, sh - 16);
    });
    return;
  }
  // Grid layout for 3+
  const cols = Math.ceil(Math.sqrt(visible.length));
  const rows = Math.ceil(visible.length / cols);
  const w = Math.floor(sw / cols) - 8;
  const h = Math.floor(sh / rows) - 8;
  visible.forEach((win, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    moveWindow(win.windowId, col * (w + 8) + 4, top + row * (h + 8) + 4);
    resizeWindow(win.windowId, w, h);
  });
}

export function WindowManager() {
  const { windows, activeWindowId, currentPageIndex, focusWindow, closeWindow } = useWindowManager();
  const [missionControl, setMissionControl] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowUp") {
        e.preventDefault();
        setMissionControl((v) => !v);
      }
      // Ctrl+\ → tile windows
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        tileWindows();
      }
      if ((e.ctrlKey || e.metaKey) && ["1", "2", "3"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        const wm = useWindowManager.getState();
        const diff = idx - wm.currentPageIndex;
        if (diff > 0) for (let i = 0; i < diff; i++) wm.nextPage();
        else for (let i = 0; i < -diff; i++) wm.prevPage();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onMC = () => setMissionControl((v) => !v);
    const onTile = () => tileWindows();
    window.addEventListener("gestureos:missioncontrol", onMC);
    window.addEventListener("gestureos:tilewindows", onTile);
    return () => {
      window.removeEventListener("gestureos:missioncontrol", onMC);
      window.removeEventListener("gestureos:tilewindows", onTile);
    };
  }, []);

  const getWindowPage = (windowId: string) => {
    const allIds = windows.map((w) => w.windowId);
    return allIds.indexOf(windowId) % TOTAL_PAGES;
  };

  const visibleWindows = windows.filter(
    (w) => !w.isMinimized && getWindowPage(w.windowId) === currentPageIndex
  );

  return (
    <>
      <div className="absolute inset-0">
        <AnimatePresence>
          {visibleWindows.map((w) => (
            <Window key={w.windowId} win={w} isActive={w.windowId === activeWindowId} />
          ))}
        </AnimatePresence>
      </div>

      {/* Page indicator dots */}
      {windows.length > 0 && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-40 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
            const hasWindows = windows.some((w) => !w.isMinimized && getWindowPage(w.windowId) === i);
            return (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                i === currentPageIndex ? "w-4 bg-white/70" : hasWindows ? "w-1.5 bg-white/30" : "w-1.5 bg-white/10"
              }`} />
            );
          })}
        </div>
      )}

      {/* Mission Control */}
      <AnimatePresence>
        {missionControl && (
          <motion.div
            className="fixed inset-0 z-[75]"
            style={{ background: "rgba(3,3,10,0.88)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMissionControl(false)}
          >
            <div className="flex h-full flex-col p-8 pt-16">
              <p className="mb-6 text-center text-xs uppercase tracking-widest text-white/40">Mission Control</p>

              {/* Desktop thumbnails */}
              <div className="flex gap-4 justify-center mb-8">
                {Array.from({ length: TOTAL_PAGES }).map((_, pageIdx) => {
                  const pageWindows = windows.filter((w) => !w.isMinimized && getWindowPage(w.windowId) === pageIdx);
                  return (
                    <motion.button key={pageIdx} whileHover={{ scale: 1.03 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const wm = useWindowManager.getState();
                        const diff = pageIdx - wm.currentPageIndex;
                        if (diff > 0) for (let i = 0; i < diff; i++) wm.nextPage();
                        else for (let i = 0; i < -diff; i++) wm.prevPage();
                        setMissionControl(false);
                      }}
                      className={`relative h-28 w-44 rounded-xl border overflow-hidden transition ${
                        pageIdx === currentPageIndex ? "border-accent-blue/60" : "border-white/10 hover:border-white/20"
                      } bg-white/[0.04]`}
                    >
                      <div className="absolute inset-0 flex flex-wrap gap-0.5 p-1">
                        {pageWindows.slice(0, 4).map((w) => (
                          <div key={w.windowId} className="h-10 w-14 rounded bg-white/10 text-[6px] text-white/30 flex items-center justify-center truncate px-1">{w.title}</div>
                        ))}
                        {pageWindows.length === 0 && <div className="flex w-full items-center justify-center text-[10px] text-white/20">Empty</div>}
                      </div>
                      <p className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/30">Desktop {pageIdx + 1}</p>
                    </motion.button>
                  );
                })}
              </div>

              {/* Window thumbnails */}
              <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
                {windows.filter((w) => !w.isMinimized).map((w) => (
                  <motion.button key={w.windowId}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    onClick={(e) => { e.stopPropagation(); focusWindow(w.windowId); setMissionControl(false); }}
                    className="relative flex h-40 w-56 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] hover:border-white/25 transition"
                  >
                    <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-2 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-accent-pink/70" />
                      <div className="h-2 w-2 rounded-full bg-accent-amber/70" />
                      <div className="h-2 w-2 rounded-full bg-accent-green/70" />
                      <span className="ml-1 text-[9px] text-white/50 truncate">{w.title}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-white/10 text-xs">{w.title}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeWindow(w.windowId); }}
                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/40 text-[8px] text-white/50 hover:bg-accent-pink/60 hover:text-white"
                    >×</button>
                  </motion.button>
                ))}
                {windows.filter((w) => !w.isMinimized).length === 0 && (
                  <p className="text-sm text-white/20">No open windows</p>
                )}
              </div>
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/20">
              Ctrl+↑ Mission Control · Ctrl+\ Tile · Ctrl+1/2/3 Switch desktop
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
