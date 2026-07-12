import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VehicleDialog from "@/components/vehicle/VehicleDialog";
import VehicleDetailsSheet from "@/components/vehicle/VehicleDetailsSheet";
import VehicleFilters, { ALL } from "@/components/vehicle/VehicleFilters";
import VehicleTable from "@/components/vehicle/VehicleTable";
import {
  useCreateVehicle,
  useUpdateVehicle,
  useUpdateVehicleStatus,
  useVehicles,
} from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import { VEHICLE_STATUS } from "@/constants/vehicleStatus";

const VehicleListPage = () => {
  const { can } = useAuth();
  const canWrite = can("vehicles");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [type, setType] = useState(ALL);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  // The API filters server-side, so send only the filters that are set.
  const { data: vehicles = [], isLoading, isError, error } = useVehicles({
    ...(search ? { search } : {}),
    ...(status !== ALL ? { status } : {}),
    ...(type !== ALL ? { type } : {}),
  });

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const updateStatus = useUpdateVehicleStatus();

  // Type is free text on the server, so build the filter options from the data.
  const { data: allVehicles = [] } = useVehicles();
  const types = useMemo(
    () => [...new Set(allVehicles.map((vehicle) => vehicle.type).filter(Boolean))].sort(),
    [allVehicles],
  );

  const counts = useMemo(
    () => ({
      total: allVehicles.length,
      available: allVehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length,
      inShop: allVehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length,
    }),
    [allVehicles],
  );

  const resetFilters = () => {
    setSearch("");
    setStatus(ALL);
    setType(ALL);
  };

  const openAdd = () => {
    setEditingVehicle(null);
    setDialogOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    const mutation = editingVehicle
      ? updateVehicle.mutateAsync({ id: editingVehicle.id, ...payload })
      : createVehicle.mutateAsync(payload);

    mutation.then(() => setDialogOpen(false)).catch(() => {
      /* the hook surfaces a toast; keep the dialog open so the input isn't lost */
    });
  };

  const isSaving = createVehicle.isPending || updateVehicle.isPending;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track the fleet, its availability, and what&apos;s in the shop.
          </p>
        </div>

        {canWrite && (
          <Button onClick={openAdd} className="w-fit">
            <Plus size={16} aria-hidden="true" />
            Add vehicle
          </Button>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Fleet size", value: counts.total },
          { label: "Available", value: counts.available },
          { label: "In shop", value: counts.inShop },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold font-numeric tabular-nums">{stat.value}</p>
          </div>
        ))}
      </section>

      <VehicleFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        types={types}
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
            <h2 className="text-lg font-semibold">Couldn&apos;t load vehicles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.response?.data?.error ?? error.message}
            </p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full border border-border p-4">
              <Search size={22} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No vehicles found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {counts.total === 0
                  ? "Add your first vehicle to get started."
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
          <VehicleTable
            vehicles={vehicles}
            canWrite={canWrite}
            onView={setViewingVehicle}
            onEdit={openEdit}
            onChangeStatus={(vehicle, next) =>
              updateStatus.mutate({ id: vehicle.id, status: next })
            }
          />
        )}
      </section>

      <VehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={editingVehicle}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />

      <VehicleDetailsSheet
        open={Boolean(viewingVehicle)}
        onOpenChange={() => setViewingVehicle(null)}
        vehicle={viewingVehicle}
      />
    </div>
  );
};

export default VehicleListPage;
