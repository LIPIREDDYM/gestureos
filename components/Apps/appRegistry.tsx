import type { AppDefinition } from "@/types/window";
import { Notes } from "./Notes";
import { Music } from "./Music";
import { Weather } from "./Weather";
import { Calculator } from "./Calculator";
import { Gallery } from "./Gallery";
import { AIAssistant } from "./AIAssistant";

/**
 * Single source of truth for every app in GestureOS. The Dock, Launcher and
 * WindowManager all read from this list — add a new app by adding one entry
 * here (and its component file) and it appears everywhere automatically.
 */
export const APP_REGISTRY: AppDefinition[] = [
  {
    id: "notes",
    title: "Notes",
    icon: "StickyNote",
    accent: "from-accent-amber to-accent-pink",
    defaultSize: { width: 560, height: 420 },
    component: Notes,
  },
  {
    id: "music",
    title: "Music",
    icon: "Music2",
    accent: "from-accent-blue to-accent-purple",
    defaultSize: { width: 380, height: 560 },
    component: Music,
  },
  {
    id: "weather",
    title: "Weather",
    icon: "CloudSun",
    accent: "from-accent-teal to-accent-blue",
    defaultSize: { width: 380, height: 560 },
    component: Weather,
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: "Calculator",
    accent: "from-white/40 to-white/10",
    defaultSize: { width: 320, height: 480 },
    component: Calculator,
  },
  {
    id: "gallery",
    title: "Gallery",
    icon: "Image",
    accent: "from-accent-green to-accent-teal",
    defaultSize: { width: 520, height: 460 },
    component: Gallery,
  },
  {
    id: "assistant",
    title: "Assistant",
    icon: "Sparkles",
    accent: "from-accent-purple to-accent-pink",
    defaultSize: { width: 400, height: 560 },
    component: AIAssistant,
  },
];
