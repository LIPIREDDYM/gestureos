"use client";

import { AnimatePresence } from "framer-motion";
import { useWindowManager } from "@/hooks/useWindowManager";
import { Window } from "./Window";

export function WindowManager() {
  const { windows, activeWindowId } = useWindowManager();

  return (
    <div className="absolute inset-0">
      <AnimatePresence>
        {windows
          .filter((w) => !w.isMinimized)
          .map((w) => (
            <Window key={w.windowId} win={w} isActive={w.windowId === activeWindowId} />
          ))}
      </AnimatePresence>
    </div>
  );
}
