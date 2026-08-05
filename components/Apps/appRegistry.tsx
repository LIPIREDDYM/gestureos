import type { AppDefinition } from "@/types/window";
import { Notes } from "./Notes";
import { Music } from "./Music";
import { Weather } from "./Weather";
import { Calculator } from "./Calculator";
import { Gallery } from "./Gallery";
import { AIAssistant } from "./AIAssistant";
import { Terminal } from "./Terminal";
import { Clock } from "./Clock";
import { Settings } from "./Settings";
import { Files } from "./Files";
import { Sketch } from "./Sketch";
import { Pomodoro } from "./Pomodoro";
import { Habits } from "./Habits";
import { Markdown } from "./Markdown";
import { Expense } from "./Expense";
import { GestureTrainer } from "./GestureTrainer";
import { ColorPicker } from "./ColorPicker";
import { Kanban } from "./Kanban";
import { Visualizer } from "./Visualizer";
import { Vault } from "./Vault";
import { RSS } from "./RSS";
import { Flashcards } from "./Flashcards";
import { AppUsage } from "./AppUsage";

export const APP_REGISTRY: AppDefinition[] = [
  { id: "notes",     title: "Notes",     icon: "StickyNote", accent: "from-accent-amber to-accent-pink",     defaultSize: { width: 560, height: 420 }, component: Notes },
  { id: "music",     title: "Music",     icon: "Music2",     accent: "from-accent-blue to-accent-purple",    defaultSize: { width: 380, height: 560 }, component: Music },
  { id: "weather",   title: "Weather",   icon: "CloudSun",   accent: "from-accent-teal to-accent-blue",      defaultSize: { width: 380, height: 560 }, component: Weather },
  { id: "calculator",title: "Calculator",icon: "Calculator", accent: "from-white/40 to-white/10",            defaultSize: { width: 320, height: 480 }, component: Calculator },
  { id: "gallery",   title: "Gallery",   icon: "Image",      accent: "from-accent-green to-accent-teal",     defaultSize: { width: 520, height: 460 }, component: Gallery },
  { id: "assistant", title: "Assistant", icon: "Sparkles",   accent: "from-accent-purple to-accent-pink",    defaultSize: { width: 400, height: 560 }, component: AIAssistant },
  { id: "terminal",  title: "Terminal",  icon: "Terminal",   accent: "from-accent-green/80 to-base-900",     defaultSize: { width: 520, height: 380 }, component: Terminal },
  { id: "clock",     title: "Clock",     icon: "Clock",      accent: "from-accent-blue/70 to-accent-teal/70",defaultSize: { width: 360, height: 540 }, component: Clock },
  { id: "settings",  title: "Settings",  icon: "Settings",   accent: "from-white/30 to-white/10",            defaultSize: { width: 420, height: 500 }, component: Settings },
  { id: "files",     title: "Files",     icon: "FolderOpen", accent: "from-accent-amber/70 to-accent-green/70",defaultSize: { width: 500, height: 420 }, component: Files },
  { id: "sketch",    title: "Sketch",    icon: "Pencil",     accent: "from-accent-pink/70 to-accent-purple/70",defaultSize: { width: 580, height: 460 }, component: Sketch },
  { id: "pomodoro",  title: "Pomodoro",  icon: "Timer",      accent: "from-accent-blue to-accent-teal",      defaultSize: { width: 340, height: 500 }, component: Pomodoro },
  { id: "habits",    title: "Habits",    icon: "CheckSquare",accent: "from-accent-green to-accent-blue",     defaultSize: { width: 560, height: 460 }, component: Habits },
  { id: "markdown",    title: "Markdown",     icon: "FileText",    accent: "from-white/20 to-white/5",               defaultSize: { width: 540, height: 480 }, component: Markdown },
  { id: "expense",     title: "Expenses",     icon: "Wallet",      accent: "from-accent-green to-accent-teal",       defaultSize: { width: 420, height: 520 }, component: Expense },
  { id: "trainer",     title: "Trainer",      icon: "Dumbbell",    accent: "from-accent-purple to-accent-blue",      defaultSize: { width: 380, height: 520 }, component: GestureTrainer },
  { id: "colorpicker", title: "Colors",       icon: "Pipette",     accent: "from-accent-pink to-accent-amber",       defaultSize: { width: 340, height: 520 }, component: ColorPicker },
  { id: "kanban",      title: "Kanban",       icon: "Kanban",      accent: "from-accent-blue to-accent-purple",      defaultSize: { width: 680, height: 480 }, component: Kanban },
  { id: "visualizer",  title: "Visualizer",   icon: "BarChart2",   accent: "from-accent-purple to-accent-pink",      defaultSize: { width: 560, height: 400 }, component: Visualizer },
  { id: "vault",       title: "Vault",        icon: "ShieldCheck", accent: "from-accent-blue/80 to-accent-teal/80",  defaultSize: { width: 420, height: 500 }, component: Vault },
  { id: "rss",         title: "RSS Reader",   icon: "Rss",         accent: "from-accent-amber to-accent-pink",       defaultSize: { width: 520, height: 500 }, component: RSS },
  { id: "flashcards",  title: "Flashcards",   icon: "BookOpen",    accent: "from-accent-teal to-accent-blue",        defaultSize: { width: 420, height: 520 }, component: Flashcards },
  { id: "appusage",    title: "App Usage",    icon: "PieChart",    accent: "from-accent-purple to-accent-blue",      defaultSize: { width: 420, height: 460 }, component: AppUsage },
];
