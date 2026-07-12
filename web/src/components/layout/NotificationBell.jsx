import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  // Read state is local — there's no server-side "seen" flag to persist to.
  const [dismissed, setDismissed] = useState(() => new Set());

  const { alerts, isLoading, isError } = useAlerts();

  const unread = alerts.filter((alert) => !dismissed.has(alert.id));
  const unreadCount = unread.length;

  const markAllRead = () => setDismissed(new Set(alerts.map((a) => a.id)));

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
          {isLoading ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Loading…
            </p>
          ) : isError ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Couldn&apos;t load alerts.
            </p>
          ) : alerts.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              Nothing needs attention.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto" role="list">
              {alerts.map((alert) => {
                const isUnread = !dismissed.has(alert.id);
                return (
                  <li key={alert.id}>
                    <Link
                      to={alert.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors duration-100",
                        "hover:bg-accent",
                        isUnread && "bg-muted/40"
                      )}
                    >
                      {/* Unread dot */}
                      <div className="mt-1.5 flex shrink-0 items-start">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            !isUnread
                              ? "bg-transparent"
                              : alert.severity === "critical"
                                ? "bg-destructive"
                                : "bg-foreground"
                          )}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {alert.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {alert.body}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
