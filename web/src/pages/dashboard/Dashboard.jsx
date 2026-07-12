import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KPICards from "@/components/dashboard/KPICards";
import FleetChart from "@/components/dashboard/FleetChart";
import RecentTrips from "@/components/dashboard/RecentTrips";
import Alerts from "@/components/dashboard/Alerts";
import { useDashboard } from "@/hooks/useDashboard";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import { VEHICLE_STATUS_LABELS } from "@/constants/vehicleStatus";

const ALL = "all";

const DashboardPage = () => {
  const { user } = useAuth();

  const [type, setType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [region, setRegion] = useState(ALL);

  // The dashboard endpoint filters server-side; send only what's set.
  const { data, isLoading, isError, error } = useDashboard({
    ...(type !== ALL ? { type } : {}),
    ...(status !== ALL ? { status } : {}),
    ...(region !== ALL ? { region } : {}),
  });

  // Type and region are free text on the server, so build the options from the fleet.
  const { data: vehicles = [] } = useVehicles();

  const { types, regions } = useMemo(
    () => ({
      types: [...new Set(vehicles.map((v) => v.type).filter(Boolean))].sort(),
      regions: [...new Set(vehicles.map((v) => v.region).filter(Boolean))].sort(),
    }),
    [vehicles],
  );

  const isFiltered = type !== ALL || status !== ALL || region !== ALL;

  const resetFilters = () => {
    setType(ALL);
    setStatus(ALL);
    setRegion(ALL);
  };

  if (isError) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t load the dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.response?.data?.error ?? error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fleet, dispatch, and compliance at a glance.
        </p>
      </header>

      {/* ── Filters ─────────────────────────────────── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by vehicle type">
            <SelectValue placeholder="Vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {types.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {Object.entries(VEHICLE_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by region">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All regions</SelectItem>
            {regions.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" onClick={resetFilters} className="sm:w-auto">
            <X size={14} aria-hidden="true" />
            Reset
          </Button>
        )}
      </section>

      {/* ── KPIs ────────────────────────────────────── */}
      <KPICards data={data} isLoading={isLoading} />

      {/* ── Trips + fleet breakdown ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RecentTrips />

        <div className="flex flex-col gap-6">
          <FleetChart data={data} isLoading={isLoading} />
          <Alerts />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
