import { useState, useMemo } from "react";
import { Plus, Fuel, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FuelLogTable from "@/components/fuel/FuelLogTable";
import FuelDialog from "@/components/fuel/FuelDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  useFuelLogs,
  useDeleteFuelLog,
  useCreateFuelLog,
  useUpdateFuelLog,
} from "@/hooks/useFuelLogs";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import { currency, litres } from "@/lib/format";

const ALL = "all";
const number = (value) => Number(value ?? 0).toLocaleString();

const FuelLogListPage = () => {
  const { can } = useAuth();
  const canWrite = can("fuelLogs");

  const [selectedVehicle, setSelectedVehicle] = useState(ALL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);

  const { data: vehicles = [] } = useVehicles();
  const createLog = useCreateFuelLog();
  const updateLog = useUpdateFuelLog();
  const deleteLog = useDeleteFuelLog();

  const queryParams = useMemo(() => {
    return selectedVehicle !== ALL ? { vehicleId: selectedVehicle } : {};
  }, [selectedVehicle]);

  const { data, isLoading, isError, error } = useFuelLogs(queryParams);
  const logs = data?.fuelLogs ?? [];

  const metrics = useMemo(() => {
    const totalLiters = logs.reduce((sum, log) => sum + Number(log.liters ?? 0), 0);
    const totalCost = logs.reduce((sum, log) => sum + Number(log.cost ?? 0), 0);
    const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;
    return { totalLiters, totalCost, avgPrice };
  }, [logs]);

  const openAdd = () => {
    setEditingLog(null);
    setDialogOpen(true);
  };

  const openEdit = (log) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  const handleSubmit = (payload) => {
    const mutation = editingLog
      ? updateLog.mutateAsync({ id: editingLog.id, ...payload })
      : createLog.mutateAsync(payload);

    mutation.then(() => setDialogOpen(false)).catch(() => {
      /* the hook toasts the error; keep the dialog open so input isn't lost */
    });
  };

  const isSaving = createLog.isPending || updateLog.isPending;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fuel logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor vehicle refueling entries, aggregate consumption, and average fuel pricing.
          </p>
        </div>

        {canWrite && (
          <Button onClick={openAdd} className="w-fit">
            <Plus size={16} aria-hidden="true" />
            Log fuel
          </Button>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total litres",
            value: litres(metrics.totalLiters),
          },
          {
            label: "Total fuel cost",
            value: currency(metrics.totalCost),
          },
          {
            label: "Average price per litre",
            value: `${currency(metrics.avgPrice)}/L`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold font-numeric tabular-nums">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Filter by vehicle">
            <SelectValue placeholder="Filter by vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.registrationNumber} ({v.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedVehicle !== ALL && (
          <Button
            variant="ghost"
            onClick={() => setSelectedVehicle(ALL)}
            className="sm:w-auto"
          >
            <X size={14} aria-hidden="true" />
            Reset filter
          </Button>
        )}
      </div>

      <section className="rounded-lg border border-border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-semibold">Couldn&apos;t load fuel logs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.response?.data?.error ?? error.message}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full border border-border p-4">
              <Fuel size={22} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No fuel logs found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedVehicle === ALL
                  ? "Log fuel usage when completing trips or recording refuel stops."
                  : "No refuel records match this vehicle."}
              </p>
            </div>
            {selectedVehicle !== ALL && (
              <Button variant="outline" onClick={() => setSelectedVehicle(ALL)}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <FuelLogTable
            logs={logs}
            canWrite={canWrite}
            onEdit={openEdit}
            onDelete={setDeletingLog}
          />
        )}
      </section>

      <FuelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={editingLog}
        onSubmit={handleSubmit}
        isPending={isSaving}
      />

      <ConfirmDialog
        open={Boolean(deletingLog)}
        onOpenChange={() => setDeletingLog(null)}
        title="Delete this fuel log?"
        description="This cannot be undone. It will also change the fuel-efficiency and cost figures in reports."
        confirmLabel="Delete"
        destructive
        isPending={deleteLog.isPending}
        onConfirm={() =>
          deleteLog
            .mutateAsync(deletingLog.id)
            .then(() => setDeletingLog(null))
            .catch(() => setDeletingLog(null))
        }
      />
    </div>
  );
};

export default FuelLogListPage;
