import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DriverStatusBadge from "@/components/driver/DriverStatusBadge";
import { useDriver } from "@/hooks/useDrivers";
import { listTrips } from "@/api/trips";
import { isLicenseExpired } from "@/constants/driverStatus";

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm font-medium">{value ?? "—"}</dd>
  </div>
);

const DriverDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: driver, isLoading, isError, error } = useDriver(id);

  const { data: trips = [] } = useQuery({
    queryKey: ["trips", { driverId: id }],
    queryFn: () => listTrips({ driverId: id }),
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
        <h1 className="text-lg font-semibold">Couldn&apos;t load this driver</h1>
        <p className="text-sm text-muted-foreground">
          {error.response?.data?.error ?? error.message}
        </p>
        <Button variant="outline" onClick={() => navigate("/drivers")}>
          Back to drivers
        </Button>
      </div>
    );
  }

  const expired = isLicenseExpired(driver);
  const completed = trips.filter((trip) => trip.status === "completed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Button>
        <DriverStatusBadge status={driver.status} />
      </div>

      {expired && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>
            Licence expired on {driver.licenseExpiryDate}. This driver is blocked from
            trip assignment.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg border border-border p-6">
          <p className="text-xs text-muted-foreground">Driver profile</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{driver.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {driver.licenseCategory} • {driver.licenseNumber}
          </p>

          <dl className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <Detail label="Licence number" value={driver.licenseNumber} />
            <Detail label="Category" value={driver.licenseCategory} />
            <Detail label="Licence expiry" value={driver.licenseExpiryDate} />
            <Detail label="Contact" value={driver.contactNumber} />
            <Detail
              label="Safety score"
              value={`${Number(driver.safetyScore).toFixed(0)} / 100`}
            />
            <Detail label="Trips completed" value={completed} />
          </dl>
        </section>

        <aside className="rounded-lg border border-border p-5">
          <p className="text-xs text-muted-foreground">Trip history</p>

          {trips.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No trips assigned to this driver yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm" role="list">
              {trips.map((trip) => (
                <li
                  key={trip.id}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {trip.source} → {trip.destination}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.vehicleRegistration ?? "—"}
                    </p>
                  </div>
                  <Badge variant="outline">{trip.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};

export default DriverDetailsPage;
