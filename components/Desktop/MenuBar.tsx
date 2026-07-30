"use client";

import { useEffect, useState } from "react";
import { Wifi, BatteryFull, Bell, Search } from "lucide-react";
import { GlassPanel } from "@/components/UI/GlassPanel";
import { useNotifications } from "@/hooks/useNotifications";

interface MenuBarProps {
  onSpotlight?: () => void;
}

export function MenuBar({ onSpotlight }: MenuBarProps) {
  const [now, setNow] = useState<Date | null>(null);
  const { notifications, toggleOpen } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-3">
      <GlassPanel className="pointer-events-auto flex items-center gap-3 rounded-full px-4 py-1.5 text-xs text-white/70">
        <span className="font-semibold text-white">GestureOS</span>
        <span className="h-3 w-px bg-white/15" />
        <Wifi size={13} />
        <BatteryFull size={13} />
        <span className="tabular-nums">
          {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
        </span>
        <span className="h-3 w-px bg-white/15" />
        <button
          onClick={onSpotlight}
          className="flex items-center gap-1 rounded-lg px-2 py-0.5 transition hover:bg-white/10"
          title="Spotlight (Ctrl+Space)"
        >
          <Search size={12} />
        </button>
        <button
          onClick={toggleOpen}
          className="relative flex items-center gap-1 rounded-lg px-2 py-0.5 transition hover:bg-white/10"
          title="Notifications"
        >
          <Bell size={12} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-blue text-[8px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      </GlassPanel>
    </div>
  );
}
