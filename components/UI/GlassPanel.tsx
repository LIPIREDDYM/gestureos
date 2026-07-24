import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

/** A rounded, blurred, translucent panel — the base building block of GestureOS's UI. */
export function GlassPanel({ strong, className, children, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        strong ? "glass-panel-strong" : "glass-panel",
        "rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
