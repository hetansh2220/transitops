import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Static mock notifications ─────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Maintenance alert",
    body: "Vehicle KBZ-4821 has an open maintenance record.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "License expiring soon",
    body: "Driver J. Santos — license expires in 12 days.",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    title: "Trip completed",
    body: "Trip #T-1042 from Makati to BGC was completed.",
    time: "1h ago",
    unread: false,
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div className="relative">
      {/* ── Trigger ─────────────────────────────────── */}
      <button
        id="notification-bell"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors duration-150",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
          open && "bg-accent text-accent-foreground"
        )}
      >
        <Bell size={17} aria-hidden="true" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Backdrop ─────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Panel ────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className={cn(
            "absolute right-0 top-10 z-50 w-80",
            "rounded-lg border border-border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="divide-y divide-border" role="list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 transition-colors duration-100",
                  "hover:bg-accent cursor-pointer",
                  n.unread && "bg-muted/40"
                )}
              >
                {/* Unread dot */}
                <div className="mt-1.5 flex shrink-0 items-start">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      n.unread ? "bg-foreground" : "bg-transparent"
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {n.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <button className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
