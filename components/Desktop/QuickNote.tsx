"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, X, GripVertical } from "lucide-react";

const STORAGE_KEY = "gestureos:quicknote";

export function QuickNote() {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setText(saved);
    } catch { /* ignore */ }

    // Toggle via custom event from desktop button
    const onToggle = () => setVisible((v) => !v);
    window.addEventListener("gestureos:quicknote", onToggle);
    return () => window.removeEventListener("gestureos:quicknote", onToggle);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, text); } catch { /* ignore */ }
  }, [text]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          drag
          dragMomentum={false}
          className="fixed right-6 top-16 z-[55] w-56 cursor-default"
          style={{ touchAction: "none" }}
        >
          <div className="rounded-2xl border border-white/15 bg-[rgba(255,214,10,0.08)] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex cursor-grab items-center gap-2 border-b border-white/10 px-3 py-2 active:cursor-grabbing">
              <GripVertical size={12} className="text-white/20" />
              <StickyNote size={12} className="text-accent-amber" />
              <span className="flex-1 text-[10px] font-medium text-white/50">Quick Note</span>
              <button onClick={() => setVisible(false)} className="text-white/20 hover:text-white/60 transition">
                <X size={12} />
              </button>
            </div>
            {/* Body */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Jot something down…"
              className="h-32 w-full resize-none bg-transparent p-3 text-xs leading-relaxed text-white/70 outline-none placeholder:text-white/20 no-scrollbar"
              autoFocus
            />
            <div className="px-3 pb-2 text-[9px] text-white/20">
              {text.trim().split(/\s+/).filter(Boolean).length} words · auto-saved
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
