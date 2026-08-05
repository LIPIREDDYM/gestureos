"use client";

import { motion } from "framer-motion";
import {
  StickyNote, Music2, CloudSun, Calculator as CalculatorIcon,
  Image as ImageIcon, Sparkles, Terminal as TerminalIcon,
  Clock, Settings as SettingsIcon, FolderOpen, LayoutGrid, Pencil,
  Timer, CheckSquare, FileText, Wallet, Dumbbell, Pipette,
  BarChart2, ShieldCheck, Rss, BookOpen, PieChart,
  type LucideIcon,
} from "lucide-react";
import { Kanban as KanbanIcon } from "lucide-react";
import { APP_REGISTRY } from "@/components/Apps/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { GlassPanel } from "@/components/UI/GlassPanel";
import { cn } from "@/utils/cn";

export const ICON_MAP: Record<string, LucideIcon> = {
  StickyNote, Music2, CloudSun,
  Calculator: CalculatorIcon,
  Image: ImageIcon,
  Sparkles,
  Terminal: TerminalIcon,
  Clock,
  Settings: SettingsIcon,
  FolderOpen,
  Pencil,
  Timer,
  CheckSquare,
  FileText,
  Wallet,
  Dumbbell,
  Pipette,
  Kanban: KanbanIcon,
  BarChart2,
  ShieldCheck,
  Rss,
  BookOpen,
  PieChart,
};

const DOCK_APP_IDS = [
  "notes", "music", "weather", "calculator", "gallery", "assistant",
  "terminal", "clock", "sketch", "pomodoro", "habits",
  "expense", "kanban", "visualizer", "vault", "rss", "flashcards",
];

export function Dock() {
  const { windows, openApp, focusWindow, toggleLauncher } = useWindowManager();
  const dockApps = APP_REGISTRY.filter((a) => DOCK_APP_IDS.includes(a.id));

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center"
      data-dock="true"
    >
      <GlassPanel strong className="flex items-end gap-1.5 rounded-3xl px-3 py-2.5 shadow-dock overflow-x-auto max-w-[96vw]">
        <DockButton onClick={toggleLauncher} label="Launcher">
          <LayoutGrid size={20} className="text-white/80" />
        </DockButton>
        <span className="mx-1 h-9 w-px bg-white/10 shrink-0" />
        {dockApps.map((app) => {
          const Icon = ICON_MAP[app.icon] ?? Sparkles;
          const runningWindow = windows.find((w) => w.appId === app.id);
          return (
            <DockButton key={app.id} label={app.title} running={!!runningWindow}
              onClick={() => { if (runningWindow) focusWindow(runningWindow.windowId); else openApp(app.id); }}>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md shrink-0", app.accent)}>
                <Icon size={16} />
              </div>
            </DockButton>
          );
        })}
      </GlassPanel>
    </motion.div>
  );
}

function DockButton({ children, onClick, label, running }: {
  children: React.ReactNode; onClick: () => void; label: string; running?: boolean;
}) {
  return (
    <motion.button onClick={onClick} whileHover={{ y: -7, scale: 1.1 }} whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="group relative flex flex-col items-center shrink-0" aria-label={label}>
      {children}
      <span className="pointer-events-none absolute -top-9 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 whitespace-nowrap">
        {label}
      </span>
      <span className={cn("mt-0.5 h-0.5 w-0.5 rounded-full transition-opacity", running ? "bg-white/70 opacity-100" : "opacity-0")} />
    </motion.button>
  );
}
