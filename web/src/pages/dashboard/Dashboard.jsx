import { Plus, Truck, Users, Route, Wrench } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";

// ── Mock stats data ───────────────────────────────────────────────────────
const STATS = [
  {
    icon: Truck,
    title: "Total Vehicles",
    value: "48",
    trend: { value: 4, label: "vs last month" },
    footer: "12 currently on trip",
  },
  {
    icon: Users,
    title: "Active Drivers",
    value: "34",
    trend: { value: 0, label: "no change" },
    footer: "2 licenses expiring soon",
  },
  {
    icon: Route,
    title: "Trips This Month",
    value: "312",
    trend: { value: 14, label: "vs last month" },
    footer: "8 currently dispatched",
  },
  {
    icon: Wrench,
    title: "Open Maintenance",
    value: "6",
    trend: { value: -2, label: "vs last month" },
    footer: "3 vehicles in shop",
  },
];

// ── StatusBadge reference table ───────────────────────────────────────────
const STATUS_PREVIEW = [
  { module: "Vehicles",    statuses: ["available", "on_trip", "in_shop", "retired"] },
  { module: "Drivers",     statuses: ["available", "on_trip", "off_duty", "suspended"] },
  { module: "Trips",       statuses: ["draft", "dispatched", "completed", "cancelled"] },
  { module: "Maintenance", statuses: ["open", "closed"] },
];

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's an overview of your fleet operations."
        action={
          <Button size="sm">
            <Plus />
            New Trip
          </Button>
        }
      />

      {/* ── Stats grid ───────────────────────────────── */}
      <section aria-label="Fleet summary statistics">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      {/* ── Status badge reference ───────────────────── */}
      <section aria-label="Status badge reference" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Status Reference</h2>
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {STATUS_PREVIEW.map(({ module, statuses }) => (
            <div
              key={module}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3"
            >
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                {module}
              </span>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
