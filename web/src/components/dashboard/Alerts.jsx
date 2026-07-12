import { Link } from "react-router-dom";
import { AlertTriangle, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/hooks/useAlerts";

/** Same derived alerts as the navbar bell: open maintenance + lapsing licences. */
const Alerts = () => {
  const { alerts, isLoading } = useAlerts();

  return (
    <div className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold">Needs attention</h2>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CircleCheck size={15} aria-hidden="true" className="text-emerald-600" />
          Nothing needs attention.
        </p>
      ) : (
        <ul className="mt-4 space-y-3" role="list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <Link
                to={alert.href}
                className="flex items-start gap-2 rounded-md p-2 -mx-2 transition-colors hover:bg-accent"
              >
                <AlertTriangle
                  size={15}
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 shrink-0",
                    alert.severity === "critical"
                      ? "text-destructive"
                      : "text-amber-500",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alerts;
