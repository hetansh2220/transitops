import { currency, kg, km } from "@/lib/format";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/common/StatusBadge";
import CompleteTripDialog from "@/components/trip/CompleteTripDialog";
import {
  useTrip,
  useDispatchTrip,
  useCancelTrip,
  useCompleteTrip,
} from "@/hooks/useTrips";
import { useVehicle } from "@/hooks/useVehicles";
import { useDriver } from "@/hooks/useDrivers";
import { useAuth } from "@/context/AuthContext";

const number = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm font-medium">{value ?? "—"}</dd>
  </div>
);

const TripDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = useAuth();
  const canWrite = can("trips");

  const [completing, setCompleting] = useState(false);

  const { data: trip, isLoading: loadingTrip, isError: isTripError, error: tripError } = useTrip(id);

  const vehicleId = trip?.vehicleId;
  const driverId = trip?.driverId;

  const { data: vehicle, isLoading: loadingVehicle } = useVehicle(vehicleId);
  const { data: driver, isLoading: loadingDriver } = useDriver(driverId);

  const dispatchTrip = useDispatchTrip();
  const cancelTrip = useCancelTrip();
  const completeTrip = useCompleteTrip();

  if (loadingTrip) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isTripError) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t load this trip</h1>
        <p className="text-sm text-muted-foreground">
          {tripError.response?.data?.error ?? tripError.message}
        </p>
        <Button variant="outline" onClick={() => navigate("/trips")}>
          Back to trips
        </Button>
      </div>
    );
  }

  const isDraft = trip.status === "draft";
  const isDispatched = trip.status === "dispatched";

  const handleDispatch = () => {
    dispatchTrip.mutate(trip.id);
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this trip?")) {
      cancelTrip.mutate(trip.id);
    }
  };

  const handleCompleteSubmit = (payload) => {
    completeTrip
      .mutateAsync({ id: trip.id, ...payload })
      .then(() => setCompleting(false))
      .catch(() => {});
  };

  // Add registration to trip object for complete dialog preview
  const tripWithReg = {
    ...trip,
    vehicleRegistration: vehicle?.registrationNumber ?? "Loading...",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/trips")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <StatusBadge status={trip.status} size="lg" />
          {canWrite && (
            <>
              {isDraft && (
                <Button onClick={handleDispatch} size="sm" className="gap-1">
                  <Play size={14} />
                  Dispatch
                </Button>
              )}
              {isDispatched && (
                <>
                  <Button onClick={() => setCompleting(true)} size="sm" className="gap-1">
                    <CheckCircle size={14} />
                    Complete
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="destructive" className="gap-1">
                    <XCircle size={14} />
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          {/* Main Info */}
          <section className="rounded-lg border border-border p-6 space-y-6">
            <div>
              <p className="text-xs text-muted-foreground font-mono">Trip #{trip.id}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {trip.source} → {trip.destination}
              </h1>
            </div>

            <dl className="grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
              <Detail label="Cargo weight" value={kg(trip.cargoWeight)} />
              <Detail label="Planned distance" value={km(trip.plannedDistance)} />
              <Detail label="Revenue" value={currency(trip.revenue)} />
            </dl>
          </section>

          {/* Odometer & Stats */}
          <section className="rounded-lg border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold tracking-tight">Odometer & Actuals</h2>
            <dl className="grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
              <Detail label="Starting Odometer" value={trip.startOdometer ? `${number(trip.startOdometer)} km` : "—"} />
              <Detail label="Ending Odometer" value={trip.endOdometer ? `${number(trip.endOdometer)} km` : "—"} />
              <Detail label="Actual Distance" value={trip.actualDistance ? `${number(trip.actualDistance)} km` : "—"} />
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          {/* Vehicle Info */}
          <aside className="rounded-lg border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Assigned Asset</h3>
            {loadingVehicle ? (
              <Skeleton className="h-20 w-full" />
            ) : vehicle ? (
              <div>
                <p className="text-base font-semibold">{vehicle.registrationNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {[vehicle.name, vehicle.model].filter(Boolean).join(" • ")}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Current status: <StatusBadge status={vehicle.status} size="sm" className="inline-flex ml-1" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-destructive">Asset not found</p>
            )}
          </aside>

          {/* Driver Info */}
          <aside className="rounded-lg border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Assigned Driver</h3>
            {loadingDriver ? (
              <Skeleton className="h-20 w-full" />
            ) : driver ? (
              <div>
                <p className="text-base font-semibold">{driver.name}</p>
                <p className="text-xs text-muted-foreground">
                  License: {driver.licenseNumber} ({driver.licenseCategory})
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Driver status: <StatusBadge status={driver.status} size="sm" className="inline-flex ml-1" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-destructive">Driver not found</p>
            )}
          </aside>

          {/* Timeline Milestones */}
          <aside className="rounded-lg border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Timeline</h3>
            <ul className="text-xs space-y-3" role="list">
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {trip.createdAt ? new Date(trip.createdAt).toLocaleString() : "—"}
                </span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Dispatched:</span>
                <span className="font-medium">
                  {trip.dispatchedAt ? new Date(trip.dispatchedAt).toLocaleString() : "—"}
                </span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {trip.completedAt ? new Date(trip.completedAt).toLocaleString() : "—"}
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <CompleteTripDialog
        open={completing}
        onOpenChange={setCompleting}
        trip={tripWithReg}
        onSubmit={handleCompleteSubmit}
        isPending={completeTrip.isPending}
      />
    </div>
  );
};

export default TripDetailsPage;
