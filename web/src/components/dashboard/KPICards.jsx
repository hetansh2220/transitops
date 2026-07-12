import {
  Activity,
  CircleCheck,
  Gauge,
  Route,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** The seven KPIs the spec asks for, all from a single /api/dashboard call. */
const kpisFrom = (data) => [
  { label: "Active vehicles", value: data.vehicles.active, icon: Truck },
  { label: "Available vehicles", value: data.vehicles.available, icon: CircleCheck },
  { label: "In maintenance", value: data.vehicles.inMaintenance, icon: Wrench },
  { label: "Active trips", value: data.trips.active, icon: Route },
  { label: "Pending trips", value: data.trips.pending, icon: Activity },
  { label: "Drivers on duty", value: data.drivers.onDuty, icon: UserCheck },
  {
    label: "Fleet utilisation",
    value: `${data.fleetUtilization}%`,
    icon: Gauge,
    accent: true,
  },
];

const KPICards = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {kpisFrom(data).map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/40"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon size={14} aria-hidden="true" />
            <p className="text-xs">{label}</p>
          </div>
          <p
            className={
              accent
                ? "mt-2 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
                : "mt-2 text-2xl font-semibold tabular-nums"
            }
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
