import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;   // emoji
  ts: number;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  isOpen: boolean;
  push: (n: Omit<Notification, "id" | "ts" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
  toggleOpen: () => void;
  setOpen: (v: boolean) => void;
}

let nid = 0;

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  isOpen: false,

  push: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: String(++nid), ts: Date.now(), read: false },
        ...s.notifications,
      ].slice(0, 50),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  clear: () => set({ notifications: [] }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (v) => set({ isOpen: v }),
}));
