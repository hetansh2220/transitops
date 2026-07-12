import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TripFilters, { ALL } from "@/components/trip/TripFilters";
import TripTable from "@/components/trip/TripTable";
import TripDialog from "@/components/trip/TripDialog";
import CompleteTripDialog from "@/components/trip/CompleteTripDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  useTrips,
  useCreateTrip,
  useUpdateTrip,
  useDispatchTrip,
  useCancelTrip,
  useCompleteTrip,
  useDeleteTrip,
} from "@/hooks/useTrips";
import { useAuth } from "@/context/AuthContext";

const TripListPage = () => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWrite = can("trips");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [cancellingTrip, setCancellingTrip] = useState(null);
  const [deletingTrip, setDeletingTrip] = useState(null);

  const { data: trips = [], isLoading, isError, error } = useTrips(
    status !== ALL ? { status } : {}
  );

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const dispatchTrip = useDispatchTrip();
  const cancelTrip = useCancelTrip();
  const completeTrip = useCompleteTrip();
  const deleteTrip = useDeleteTrip();

  const filteredTrips = useMemo(() => {
    if (!search) return trips;
    const query = search.toLowerCase();
    return trips.filter(
      (t) =>
        t.source?.toLowerCase().includes(query) ||
        t.destination?.toLowerCase().includes(query)
    );
  }, [trips, search]);

  const counts = useMemo(() => {
    return {
      total: trips.length,
      dispatched: trips.filter((t) => t.status === "dispatched").length,
      completed: trips.filter((t) => t.status === "completed").length,
    };
  }, [trips]);

  const resetFilters = () => {
    setSearch("");
    setStatus(ALL);
  };

  const handleDispatch = (trip) => {
    dispatchTrip.mutate(trip.id);
  };

  const openAdd = () => {
    setEditingTrip(null);
    setDialogOpen(true);
  };

  const openEdit = (trip) => {
    setEditingTrip(trip);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    const mutation = editingTrip
      ? updateTrip.mutateAsync({ id: editingTrip.id, ...payload })
      : createTrip.mutateAsync(payload);

    mutation.then(() => setDialogOpen(false)).catch(() => {
      /* the hook toasts the error; keep the dialog open so input isn't lost */
    });
  };

  const isSaving = createTrip.isPending || updateTrip.isPending;

  const handleCompleteSubmit = (payload) => {
    if (!completingTrip) return;
    completeTrip
      .mutateAsync({ id: completingTrip.id, ...payload })
      .then(() => setCompletingTrip(null))
      .catch(() => {});
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dispatch vehicles, assign drivers, and monitor ongoing trip routes.
          </p>
        </div>

        {canWrite && (
          <Button onClick={openAdd} className="w-fit">
            <Plus size={16} aria-hidden="true" />
            New trip
          </Button>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total trips", value: counts.total },
          { label: "Dispatched", value: counts.dispatched },
          { label: "Completed", value: counts.completed },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold font-numeric tabular-nums">{stat.value}</p>
          </div>
        ))}
      </section>

      <TripFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={resetFilters}
      />

      <section className="rounded-lg border border-border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-semibold">Couldn&apos;t load trips</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.response?.data?.error ?? error.message}
            </p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full border border-border p-4">
              <Search size={22} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No trips found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {trips.length === 0
                  ? "Create a new trip to dispatch a vehicle."
                  : "Try a different search term or reset the filters."}
              </p>
            </div>
            {trips.length > 0 && (
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <TripTable
            trips={filteredTrips}
            canWrite={canWrite}
            onView={(trip) => navigate(`/trips/${trip.id}`)}
            onEdit={openEdit}
            onDelete={setDeletingTrip}
            onDispatch={handleDispatch}
            onComplete={setCompletingTrip}
            onCancel={setCancellingTrip}
          />
        )}
      </section>

      <TripDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trip={editingTrip}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />

      <CompleteTripDialog
        open={Boolean(completingTrip)}
        onOpenChange={(open) => !open && setCompletingTrip(null)}
        trip={completingTrip}
        onSubmit={handleCompleteSubmit}
        isPending={completeTrip.isPending}
      />

      <ConfirmDialog
        open={Boolean(cancellingTrip)}
        onOpenChange={() => setCancellingTrip(null)}
        title="Cancel this trip?"
        description="If the trip is dispatched, its vehicle and driver are released back to Available."
        confirmLabel="Cancel trip"
        cancelLabel="Keep it"
        destructive
        isPending={cancelTrip.isPending}
        onConfirm={() =>
          cancelTrip
            .mutateAsync(cancellingTrip.id)
            .then(() => setCancellingTrip(null))
            .catch(() => setCancellingTrip(null))
        }
      />

      <ConfirmDialog
        open={Boolean(deletingTrip)}
        onOpenChange={() => setDeletingTrip(null)}
        title="Delete this trip?"
        description="This cannot be undone, and it removes the trip from revenue and distance reports."
        confirmLabel="Delete"
        destructive
        isPending={deleteTrip.isPending}
        onConfirm={() =>
          deleteTrip
            .mutateAsync(deletingTrip.id)
            .then(() => setDeletingTrip(null))
            .catch(() => setDeletingTrip(null))
        }
      />
    </div>
  );
};

export default TripListPage;
