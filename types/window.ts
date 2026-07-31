import type { ComponentType } from "react";

export type AppId = "notes" | "music" | "weather" | "calculator" | "gallery" | "assistant" | "terminal" | "clock" | "settings" | "files" | "sketch";

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: string; // lucide icon name, resolved in Dock
  accent: string; // tailwind gradient classes
  defaultSize: { width: number; height: number };
  component: ComponentType;
}

export interface WindowInstance {
  windowId: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}
