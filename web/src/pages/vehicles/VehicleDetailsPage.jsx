import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import VehicleStatusBadge from "@/components/vehicle/VehicleStatusBadge";
import { useVehicle } from "@/hooks/useVehicles";
import { listMaintenanceLogs } from "@/api/maintenance";

const number = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm font-medium">{value ?? "—"}</dd>
  </div>
);

const VehicleDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: vehicle, isLoading, isError, error } = useVehicle(id);

  // The vehicle's own service history — real records, not a fabricated schedule.
  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", { vehicleId: id }],
    queryFn: () => listMaintenanceLogs({ vehicleId: id }),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t load this vehicle</h1>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.error ?? error.message}
        </p>
        <Button variant="outline" onClick={() => navigate("/vehicles")}>
          Back to vehicles
        </Button>
      </div>
    );
  }

  const logs = maintenance?.maintenanceLogs ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Button>
        <VehicleStatusBadge status={vehicle.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg border border-border p-6">
          <p className="text-xs text-muted-foreground">Fleet asset</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {vehicle.registrationNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[vehicle.name, vehicle.model].filter(Boolean).join(" • ")}
          </p>

          <dl className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <Detail label="Type" value={vehicle.type} />
            <Detail label="Region" value={vehicle.region} />
            <Detail
              label="Max load capacity"
              value={`${number(vehicle.maxLoadCapacity)} kg`}
            />
            <Detail label="Odometer" value={`${number(vehicle.odometer)} km`} />
            <Detail label="Acquisition cost" value={number(vehicle.acquisitionCost)} />
            <Detail
              label="Added"
              value={
                vehicle.createdAt
                  ? new Date(vehicle.createdAt).toLocaleDateString()
                  : null
              }
            />
          </dl>
        </section>

        <aside className="rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground">Maintenance history</p>

          {logs.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No maintenance recorded for this vehicle.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm" role="list">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{log.serviceType}</p>
                    <p className="text-xs text-muted-foreground">{log.date}</p>
                  </div>
                  <Badge variant={log.status === "open" ? "default" : "outline"}>
                    {log.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
