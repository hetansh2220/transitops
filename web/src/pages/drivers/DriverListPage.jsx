import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DriverDialog from "@/components/driver/DriverDialog";
import DriverDetailsSheet from "@/components/driver/DriverDetailsSheet";
import DriverFilters, { ALL } from "@/components/driver/DriverFilters";
import DriverTable from "@/components/driver/DriverTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  useCreateDriver,
  useDeleteDriver,
  useDrivers,
  useUpdateDriver,
} from "@/hooks/useDrivers";
import { useAuth } from "@/context/AuthContext";
import { listTrips } from "@/api/trips";
import { DRIVER_STATUS, isLicenseExpired } from "@/constants/driverStatus";

const DriverListPage = () => {
  const { can } = useAuth();
  const canWrite = can("drivers");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [viewingDriver, setViewingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);

  const { data: drivers = [], isLoading, isError, error } = useDrivers();

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  // The drivers API carries no trip count, so derive it from completed trips.
  const { data: completedTrips = [] } = useQuery({
    queryKey: ["trips", { status: "completed" }],
    queryFn: () => listTrips({ status: "completed" }),
  });

  const tripCounts = useMemo(() => {
    const counts = {};
    for (const trip of completedTrips) {
      counts[trip.driverId] = (counts[trip.driverId] ?? 0) + 1;
    }
    return counts;
  }, [completedTrips]);

  // Filtered client-side — unlike vehicles, the drivers endpoint takes no query params.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        !term || `${driver.name} ${driver.licenseNumber}`.toLowerCase().includes(term);
      const matchesStatus = status === ALL || driver.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, status]);

  const counts = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter((d) => d.status === DRIVER_STATUS.AVAILABLE).length,
      expired: drivers.filter(isLicenseExpired).length,
    }),
    [drivers],
  );

  const resetFilters = () => {
    setSearch("");
    setStatus(ALL);
  };

  const openAdd = () => {
    setEditingDriver(null);
    setDialogOpen(true);
  };

  const openEdit = (driver) => {
    setEditingDriver(driver);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    const mutation = editingDriver
      ? updateDriver.mutateAsync({ id: editingDriver.id, ...payload })
      : createDriver.mutateAsync(payload);

    mutation.then(() => setDialogOpen(false)).catch(() => {
      /* the hook toasts the error; keep the dialog open so input isn't lost */
    });
  };

  const isSaving = createDriver.isPending || updateDriver.isPending;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Driver profiles, licence compliance, and safety scores.
          </p>
        </div>

        {canWrite && (
          <Button onClick={openAdd} className="w-fit">
            <Plus size={16} aria-hidden="true" />
            Add driver
          </Button>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total drivers", value: counts.total },
          { label: "Available", value: counts.available },
          { label: "Expired licences", value: counts.expired, alert: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p
              className={
                stat.alert && stat.value > 0
                  ? "mt-1 text-2xl font-semibold tabular-nums text-destructive"
                  : "mt-1 text-2xl font-semibold tabular-nums"
              }
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <DriverFilters
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
            <h2 className="text-lg font-semibold">Couldn&apos;t load drivers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.response?.data?.error ?? error.message}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full border border-border p-4">
              <Search size={22} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No drivers found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {counts.total === 0
                  ? "Add your first driver to get started."
                  : "Try a different search term or reset the filters."}
              </p>
            </div>
            {counts.total > 0 && (
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <DriverTable
            drivers={filtered}
            tripCounts={tripCounts}
            canWrite={canWrite}
            onView={setViewingDriver}
            onEdit={openEdit}
            onChangeStatus={(driver, next) =>
              updateDriver.mutate({ id: driver.id, status: next })
            }
            onDelete={setDeletingDriver}
          />
        )}
      </section>

      <DriverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        driver={editingDriver}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />

      <DriverDetailsSheet
        open={Boolean(viewingDriver)}
        onOpenChange={() => setViewingDriver(null)}
        driver={viewingDriver}
        tripCount={viewingDriver ? tripCounts[viewingDriver.id] : 0}
      />

      <ConfirmDialog
        open={Boolean(deletingDriver)}
        onOpenChange={() => setDeletingDriver(null)}
        title={`Delete ${deletingDriver?.name ?? "driver"}?`}
        description="This cannot be undone. Drivers with trips on record can't be deleted — suspend them instead."
        confirmLabel="Delete"
        destructive
        isPending={deleteDriver.isPending}
        onConfirm={() =>
          deleteDriver
            .mutateAsync(deletingDriver.id)
            .then(() => setDeletingDriver(null))
            .catch(() => setDeletingDriver(null))
        }
      />
    </div>
  );
};

export default DriverListPage;
