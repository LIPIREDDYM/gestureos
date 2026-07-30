"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { ICON_MAP } from "./Dock";
import { Sparkles } from "lucide-react";

interface SpotlightProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "Enable Gesture Control", action: "gesture", icon: "✋" },
  { label: "Show Gesture Guide", action: "guide", icon: "❓" },
];

export function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { openApp } = useWindowManager();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Cmd/Ctrl + Space to open
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        onClose(); // toggle
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filteredApps = APP_REGISTRY.filter(
    (a) => !query || a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center pt-32"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: -16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[560px]"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.12] px-4 py-3.5 backdrop-blur-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <Search size={18} className="shrink-0 text-white/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredApps[0]) {
                    openApp(filteredApps[0].id);
                    onClose();
                  }
                }}
                placeholder="Search apps, commands…"
                className="flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/30"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results */}
            {filteredApps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-2xl bg-white/[0.09] backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {query === "" && (
                  <p className="px-4 pt-3 text-[10px] uppercase tracking-widest text-white/30">Apps</p>
                )}
                <div className="p-2">
                  {filteredApps.slice(0, 8).map((app, i) => {
                    const Icon = ICON_MAP[app.icon] ?? Sparkles;
                    return (
                      <motion.button
                        key={app.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => { openApp(app.id); onClose(); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.accent}`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/90">{app.title}</p>
                          <p className="text-xs text-white/30">Application</p>
                        </div>
                        <span className="ml-auto text-xs text-white/20">↵</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <p className="mt-3 text-center text-xs text-white/25">
              ✌️ Peace sign · Ctrl+Space · Esc to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
