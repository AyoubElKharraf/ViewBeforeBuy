import { create } from "zustand";
import type { AppNotification } from "@/lib/api";

type NotificationsState = {
  items: AppNotification[];
  unreadCount: number;
  setFromFetch: (items: AppNotification[], unreadCount: number) => void;
  addFromSocket: (n: AppNotification) => void;
  markReadLocal: (id: string) => void;
  markAllReadLocal: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unreadCount: 0,
  setFromFetch: (items, unreadCount) => set({ items, unreadCount }),
  addFromSocket: (n) =>
    set((s) => ({
      items: [n, ...s.items.filter((i) => i.id !== n.id)],
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),
  markReadLocal: (id) =>
    set((s) => {
      const wasUnread = s.items.find((i) => i.id === id && !i.read);
      return {
        items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    }),
  markAllReadLocal: () =>
    set((s) => ({
      items: s.items.map((i) => ({ ...i, read: true })),
      unreadCount: 0,
    })),
}));
