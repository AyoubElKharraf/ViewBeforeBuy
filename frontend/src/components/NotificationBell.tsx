"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, MessageSquare, Star, Heart, FileText, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

function iconFor(type: string) {
  switch (type) {
    case "NEW_MESSAGE":
      return MessageSquare;
    case "PROPERTY_LIKED":
      return Heart;
    case "REVIEW_RECEIVED":
      return Star;
    case "REPORT_READY":
      return FileText;
    default:
      return AlertCircle;
  }
}

function hrefFor(
  data: Record<string, unknown> | null | undefined,
  accent: "client" | "agency",
): string | null {
  if (!data) return null;
  if (typeof data.propertyId === "string") {
    return accent === "agency"
      ? `/agency/properties`
      : `/client/properties/${data.propertyId}`;
  }
  if (typeof data.conversationId === "string") {
    return accent === "agency" ? `/agency/conversations` : `/client`;
  }
  return null;
}

export function NotificationBell({ accent = "client" }: { accent?: "client" | "agency" }) {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const isAgency = accent === "agency";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          isAgency
            ? "relative w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-white/10"
            : "relative w-9 h-9 rounded-full client-card flex items-center justify-center"
        }
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div
            className={`absolute right-0 top-11 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-xl ${
              isAgency
                ? "bg-[color:var(--color-agency-card)] border-white/10 text-white"
                : "bg-white border-[color:var(--color-client-border)]"
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-inherit">
              <span className="text-sm font-medium">Notifications</span>
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] inline-flex items-center gap-1 opacity-70 hover:opacity-100"
              >
                <CheckCheck className="w-3 h-3" /> Tout lire
              </button>
            </div>
            {items.length === 0 ? (
              <div className="p-4 text-sm opacity-60">Aucune notification</div>
            ) : (
              <ul>
                {items.slice(0, 15).map((n) => {
                  const Icon = iconFor(n.type);
                  const href = hrefFor(n.data as Record<string, unknown> | null, accent);
                  const content = (
                    <div className="flex gap-2 px-3 py-2.5 hover:bg-black/5">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {n.title}
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </div>
                        <div className="text-xs opacity-60 line-clamp-2">{n.message}</div>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id} className={!n.read ? "bg-black/[0.03]" : ""}>
                      {href ? (
                        <Link
                          href={href}
                          onClick={() => {
                            void markRead(n.id);
                            setOpen(false);
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => void markRead(n.id)}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
