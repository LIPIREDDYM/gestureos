"use client";

import { motion } from "framer-motion";
import {
  StickyNote,
  Music2,
  CloudSun,
  Calculator as CalculatorIcon,
  Image as ImageIcon,
  Sparkles,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { GlassPanel } from "@/components/UI/GlassPanel";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  StickyNote,
  Music2,
  CloudSun,
  Calculator: CalculatorIcon,
  Image: ImageIcon,
  Sparkles,
};

export function Dock() {
  const { windows, openApp, focusWindow, toggleLauncher } = useWindowManager();

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center"
    >
      <GlassPanel strong className="flex items-end gap-2 rounded-3xl px-3 py-2.5 shadow-dock">
        <DockButton onClick={toggleLauncher} label="Launcher">
          <LayoutGrid size={22} className="text-white/80" />
        </DockButton>

        <span className="mx-1 h-9 w-px bg-white/10" />

        {APP_REGISTRY.map((app) => {
          const Icon = ICONS[app.icon] ?? Sparkles;
          const runningWindow = windows.find((w) => w.appId === app.id);
          return (
            <DockButton
              key={app.id}
              label={app.title}
              running={!!runningWindow}
              onClick={() => {
                if (runningWindow) focusWindow(runningWindow.windowId);
                else openApp(app.id);
              }}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                  app.accent
                )}
              >
                <Icon size={18} />
              </div>
            </DockButton>
          );
        })}
      </GlassPanel>
    </motion.div>
  );
}

function DockButton({
  children,
  onClick,
  label,
  running,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  running?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="group relative flex flex-col items-center"
      aria-label={label}
    >
      {children}
      <span className="pointer-events-none absolute -top-9 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 h-1 w-1 rounded-full transition-opacity",
          running ? "bg-white/70 opacity-100" : "opacity-0"
        )}
      />
    </motion.button>
  );
}
