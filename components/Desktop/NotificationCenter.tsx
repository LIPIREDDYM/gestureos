"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { GlassPanel } from "@/components/UI/GlassPanel";

export function NotificationCenter() {
  const { notifications, isOpen, setOpen, markAllRead, clear } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Bell button in menu bar area — rendered separately, just the panel here */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[85]"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-14 w-80"
            >
              <GlassPanel strong className="rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-white/50" />
                    <span className="text-sm font-medium text-white/80">Notifications</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-accent-blue px-1.5 py-0.5 text-[10px] text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button onClick={markAllRead} className="text-white/30 hover:text-white/60 transition">
                          <Check size={13} />
                        </button>
                        <button onClick={clear} className="text-white/30 hover:text-accent-pink transition">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-white/25">
                      <BellOff size={22} />
                      <p className="text-xs">No notifications</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.map((n) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 rounded-xl p-3 transition ${n.read ? "opacity-50" : "bg-white/[0.04]"}`}
                        >
                          <span className="text-xl">{n.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white/80 truncate">{n.title}</p>
                            <p className="text-xs text-white/40 truncate">{n.body}</p>
                            <p className="mt-0.5 text-[10px] text-white/20">
                              {new Date(n.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-blue" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
