"use client";

import { useEffect } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { useNotificationsStore } from "@/store/notifications";

export function useNotifications() {
  const { user } = useAuth();
  const { items, unreadCount, setFromFetch, addFromSocket, markReadLocal, markAllReadLocal } =
    useNotificationsStore();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getNotifications()
      .then((res) => {
        if (!cancelled) setFromFetch(res.items, res.unreadCount);
      })
      .catch(() => {
        /* ignore */
      });

    const socket = getSocket();
    socket.emit("user:join", user.id);
    const onNew = (n: AppNotification) => addFromSocket(n);
    socket.on("notification:new", onNew);
    return () => {
      cancelled = true;
      socket.off("notification:new", onNew);
    };
  }, [user, setFromFetch, addFromSocket]);

  async function markRead(id: string) {
    markReadLocal(id);
    try {
      await markNotificationRead(id);
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    markAllReadLocal();
    try {
      await markAllNotificationsRead();
    } catch {
      /* ignore */
    }
  }

  return { items, unreadCount, markRead, markAllRead };
}
