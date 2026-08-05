"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, RefreshCw, Maximize2, Monitor,
  StickyNote, Sparkles, Palette, Terminal,
} from "lucide-react";
import { useWindowManager } from "@/hooks/useWindowManager";
import type { AppId } from "@/types/window";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  divider?: boolean;
}

export function ContextMenu() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openApp, toggleLauncher } = useWindowManager();

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      // Only trigger on bare desktop (not inside a window or dock)
      const target = e.target as HTMLElement;
      if (target.closest("[data-window]") || target.closest("[data-dock]")) return;
      e.preventDefault();
      // Clamp to viewport
      const x = Math.min(e.clientX, window.innerWidth - 220);
      const y = Math.min(e.clientY, window.innerHeight - 320);
      setPos({ x, y });
    };
    const onClose = () => setPos(null);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("click", onClose);
    window.addEventListener("keydown", (e) => e.key === "Escape" && onClose());
    return () => {
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("click", onClose);
    };
  }, []);

  if (!pos) return null;

  const items: MenuItem[] = [
    {
      label: "App Launcher",
      icon: <LayoutGrid size={13} />,
      action: () => toggleLauncher(),
    },
    {
      label: "Mission Control",
      icon: <Maximize2 size={13} />,
      action: () => window.dispatchEvent(new CustomEvent("gestureos:missioncontrol")),
    },
    {
      label: "Tile Windows",
      icon: <Monitor size={13} />,
      action: () => window.dispatchEvent(new CustomEvent("gestureos:tilewindows")),
      divider: true,
    },
    {
      label: "New Note",
      icon: <StickyNote size={13} />,
      action: () => openApp("notes" as AppId),
    },
    {
      label: "Open Terminal",
      icon: <Terminal size={13} />,
      action: () => openApp("terminal" as AppId),
    },
    {
      label: "Open Sketch",
      icon: <Palette size={13} />,
      action: () => openApp("sketch" as AppId),
    },
    {
      label: "Open Assistant",
      icon: <Sparkles size={13} />,
      action: () => openApp("assistant" as AppId),
      divider: true,
    },
    {
      label: "Reload Desktop",
      icon: <RefreshCw size={13} />,
      action: () => window.location.reload(),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="fixed z-[200] w-52 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
        style={{ left: pos.x, top: pos.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-1.5">
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && i > 0 && (
                <div className="mx-2 my-1 h-px bg-white/10" />
              )}
              <button
                onClick={() => { item.action(); setPos(null); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <span className="text-white/40">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
