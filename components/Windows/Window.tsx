"use client";

import { useRef, useState } from "react";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import type { WindowInstance } from "@/types/window";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { cn } from "@/utils/cn";

interface WindowProps {
  win: WindowInstance;
  isActive: boolean;
}

/** Snap zones: drag within SNAP_PX of screen edge → snap to half/full */
const SNAP_PX = 32;

function getSnapTarget(x: number, y: number, w: number, h: number) {
  const sw = window.innerWidth;
  const sh = window.innerHeight;
  // Left half
  if (x < SNAP_PX) return { x: 0, y: 40, width: sw / 2, height: sh - 90 };
  // Right half
  if (x + w > sw - SNAP_PX) return { x: sw / 2, y: 40, width: sw / 2, height: sh - 90 };
  // Top → maximize
  if (y < SNAP_PX + 40) return { x: 0, y: 40, width: sw, height: sh - 90 };
  return null;
}

export function Window({ win, isActive }: WindowProps) {
  const dragControls = useDragControls();
  const resizingRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = useWindowManager();

  const def = APP_REGISTRY.find((a) => a.id === win.appId);
  if (!def) return null;
  const AppComponent = def.component;

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    resizingRef.current = { startX: e.clientX, startY: e.clientY, startW: win.width, startH: win.height };
    window.addEventListener("pointermove", onResizeMove);
    window.addEventListener("pointerup", stopResize);
  };

  const onResizeMove = (e: PointerEvent) => {
    const r = resizingRef.current;
    if (!r) return;
    resizeWindow(win.windowId, Math.max(280, r.startW + (e.clientX - r.startX)), Math.max(220, r.startH + (e.clientY - r.startY)));
  };

  const stopResize = () => {
    resizingRef.current = null;
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", stopResize);
  };

  return (
    <>
      {/* Snap preview ghost */}
      {snapPreview && (
        <div
          className="pointer-events-none fixed rounded-2xl border border-accent-blue/40 bg-accent-blue/10 backdrop-blur-sm transition-all"
          style={{ left: snapPreview.x, top: snapPreview.y, width: snapPreview.w, height: snapPreview.h, zIndex: win.zIndex - 1 }}
        />
      )}

      <motion.div
        key={win.windowId}
        drag={!win.isMaximized}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        style={{ position: "absolute", zIndex: win.zIndex, x: dragX, y: dragY }}
        onDrag={(_, info) => {
          const newX = win.x + info.offset.x;
          const newY = win.y + info.offset.y;
          const snap = getSnapTarget(newX, newY, win.width, win.height);
          setSnapPreview(snap ? { x: snap.x, y: snap.y, w: snap.width, h: snap.height } : null);
        }}
        onDragEnd={(_, info) => {
          const newX = win.x + info.offset.x;
          const newY = win.y + info.offset.y;
          const snap = getSnapTarget(newX, newY, win.width, win.height);
          setSnapPreview(null);
          if (snap) {
            moveWindow(win.windowId, snap.x, snap.y);
            resizeWindow(win.windowId, snap.width, snap.height);
          } else {
            moveWindow(win.windowId, newX, newY);
          }
          dragX.set(0);
          dragY.set(0);
        }}
        onPointerDown={() => focusWindow(win.windowId)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          left: win.isMaximized ? 12 : win.x,
          top: win.isMaximized ? 12 : win.y,
          width: win.isMaximized ? "calc(100vw - 24px)" : win.width,
          height: win.isMaximized ? "calc(100vh - 100px)" : win.height,
        }}
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className={cn(
          "glass-panel-strong flex flex-col overflow-hidden rounded-2xl",
          isActive ? "ring-1 ring-white/25" : "ring-1 ring-white/5"
        )}
        data-window="true"
      >
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onDoubleClick={() => toggleMaximize(win.windowId)}
          className="flex cursor-grab items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5 active:cursor-grabbing"
        >
          <div className="flex items-center gap-1.5">
            <button onClick={() => closeWindow(win.windowId)} className="h-3 w-3 rounded-full bg-accent-pink/80 transition hover:brightness-125" aria-label="Close" />
            <button onClick={() => minimizeWindow(win.windowId)} className="h-3 w-3 rounded-full bg-accent-amber/80 transition hover:brightness-125" aria-label="Minimize" />
            <button onClick={() => toggleMaximize(win.windowId)} className="h-3 w-3 rounded-full bg-accent-green/80 transition hover:brightness-125" aria-label="Maximize" />
          </div>
          <p className="ml-2 flex-1 select-none truncate text-center text-xs font-medium text-white/60">{win.title}</p>
          <button onClick={() => toggleMaximize(win.windowId)} className="text-white/30 transition hover:text-white/60">
            {win.isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>

        <div className="min-h-0 flex-1 text-white">
          <AppComponent />
        </div>

        {!win.isMaximized && (
          <div onPointerDown={startResize} className="absolute bottom-1 right-1 h-4 w-4 cursor-nwse-resize opacity-40 hover:opacity-80">
            <svg viewBox="0 0 16 16" className="h-full w-full">
              <path d="M14 2 L2 14 M14 8 L8 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </motion.div>
    </>
  );
}
