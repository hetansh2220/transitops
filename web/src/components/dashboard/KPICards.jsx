import {
  Activity,
  CircleCheck,
  Gauge,
  Route,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** The seven KPIs the spec asks for, all from a single /api/dashboard call. */
const kpisFrom = (data) => [
  { label: "Active vehicles", value: data.vehicles.active, icon: Truck },
  { label: "Available", value: data.vehicles.available, icon: CircleCheck },
  { label: "In maintenance", value: data.vehicles.inMaintenance, icon: Wrench },
  { label: "Active trips", value: data.trips.active, icon: Route },
  { label: "Pending trips", value: data.trips.pending, icon: Activity },
  { label: "Drivers on duty", value: data.drivers.onDuty, icon: UserCheck },
  {
    label: "Fleet utilisation",
    value: `${data.fleetUtilization}%`,
    icon: Gauge,
    // The one number worth an accent — everything else stays neutral.
    accent: true,
  },
];

const KPICards = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-[84px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {kpisFrom(data).map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className={cn(
            "rounded-lg border border-border bg-card p-4",
            "transition-colors duration-150 hover:border-foreground/20",
          )}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon size={13} aria-hidden="true" />
            <p className="truncate text-xs">{label}</p>
          </div>
          <p
            className={cn(
              "mt-2 font-numeric text-2xl font-medium tracking-tight tabular-nums",
              accent && "text-success",
            )}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
