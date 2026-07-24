"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  StickyNote,
  Music2,
  CloudSun,
  Calculator as CalculatorIcon,
  Image as ImageIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { GlassPanel } from "@/components/UI/GlassPanel";

const ICONS: Record<string, LucideIcon> = {
  StickyNote,
  Music2,
  CloudSun,
  Calculator: CalculatorIcon,
  Image: ImageIcon,
  Sparkles,
};

export function Launcher() {
  const { isLauncherOpen, setLauncherOpen, openApp } = useWindowManager();

  return (
    <AnimatePresence>
      {isLauncherOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLauncherOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassPanel strong className="w-[560px] rounded-3xl p-8">
              <p className="mb-1 text-center text-sm text-white/50">Open Palm detected</p>
              <h2 className="mb-6 text-center text-2xl font-semibold text-gradient-aurora">
                App Launcher
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {APP_REGISTRY.map((app, i) => {
                  const Icon = ICONS[app.icon] ?? Sparkles;
                  return (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openApp(app.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl p-4 transition hover:bg-white/5"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.accent} shadow-lg`}
                      >
                        <Icon size={24} className="text-white" />
                      </div>
                      <span className="text-xs text-white/70">{app.title}</span>
                    </motion.button>
                  );
                })}
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
