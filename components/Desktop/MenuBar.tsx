"use client";

import { useEffect, useState } from "react";
import { Wifi, BatteryFull } from "lucide-react";
import { GlassPanel } from "@/components/UI/GlassPanel";

export function MenuBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-3">
      <GlassPanel className="pointer-events-auto flex items-center gap-4 rounded-full px-4 py-1.5 text-xs text-white/70">
        <span className="font-semibold text-white">GestureOS</span>
        <span className="h-3 w-px bg-white/15" />
        <Wifi size={13} />
        <BatteryFull size={13} />
        <span className="tabular-nums">
          {now
            ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--:--"}
        </span>
      </GlassPanel>
    </div>
  );
}
