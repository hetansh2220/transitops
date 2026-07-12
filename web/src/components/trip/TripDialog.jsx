import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { VEHICLE_STATUS } from "@/constants/vehicleStatus";
import { DRIVER_STATUS, isLicenseExpired } from "@/constants/driverStatus";

const schema = z.object({
  source: z.string().min(1, "Source is required").max(150),
  destination: z.string().min(1, "Destination is required").max(150),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  cargoWeight: z.coerce
    .number({ message: "Cargo weight must be a number" })
    .positive("Must be greater than 0"),
  plannedDistance: z.union([
    z.literal(""),
    z.coerce.number({ message: "Must be a number" }).nonnegative("Cannot be negative"),
  ]),
  revenue: z.union([
    z.literal(""),
    z.coerce.number({ message: "Must be a number" }).nonnegative("Cannot be negative"),
  ]),
});

const EMPTY = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeight: "",
  plannedDistance: "",
  revenue: "",
};

const toFormValues = (trip) => ({
  source: trip.source ?? "",
  destination: trip.destination ?? "",
  vehicleId: trip.vehicleId ? String(trip.vehicleId) : "",
  driverId: trip.driverId ? String(trip.driverId) : "",
  cargoWeight: trip.cargoWeight ? Number(trip.cargoWeight) : "",
  plannedDistance: trip.plannedDistance ? Number(trip.plannedDistance) : "",
  revenue: trip.revenue ? Number(trip.revenue) : "",
});

const TripDialog = ({ open, onOpenChange, trip, onSubmit, isPending }) => {
  const isEdit = Boolean(trip);

  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(trip ? toFormValues(trip) : EMPTY);
  }, [open, trip, reset]);

  // Retired and in-shop vehicles must never appear in the dispatch pool. The
  // trip's own vehicle stays selectable while editing, or the form loses it.
  const selectableVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status === VEHICLE_STATUS.AVAILABLE ||
          (trip && String(vehicle.id) === String(trip.vehicleId)),
      ),
    [vehicles, trip],
  );

  // Same for drivers — but an expired licence disqualifies a driver even when
  // their status still reads 'available', which is exactly the compliance gap
  // the safety officer exists to catch.
  const selectableDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          (driver.status === DRIVER_STATUS.AVAILABLE && !isLicenseExpired(driver)) ||
          (trip && String(driver.id) === String(trip.driverId)),
      ),
    [drivers, trip],
  );

  const selectedVehicleId = watch("vehicleId");
  const cargoWeight = watch("cargoWeight");

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => String(vehicle.id) === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  // Checked live, not on submit — the server rejects it either way, but the
  // point is that you see it before you try.
  const capacity = selectedVehicle ? Number(selectedVehicle.maxLoadCapacity) : null;
  const overloadBy =
    capacity !== null && Number(cargoWeight) > capacity
      ? Number(cargoWeight) - capacity
      : 0;

  const submit = (values) => {
    if (overloadBy > 0) return;

    const payload = {
      ...values,
      vehicleId: Number(values.vehicleId),
      driverId: Number(values.driverId),
      cargoWeight: Number(values.cargoWeight),
    };

    // Blank optionals must be dropped, not sent as "".
    if (values.plannedDistance === "") delete payload.plannedDistance;
    else payload.plannedDistance = Number(values.plannedDistance);

    if (values.revenue === "") delete payload.revenue;
    else payload.revenue = Number(values.revenue);

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit trip" : "Create trip"}</DialogTitle>
          <DialogDescription>
            Trips start as a draft. Dispatch them from the list once they&apos;re ready.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.source)}>
              <FieldLabel htmlFor="source">Source</FieldLabel>
              <Input
                id="source"
                placeholder="Gandhinagar Depot"
                aria-invalid={Boolean(errors.source)}
                {...register("source")}
              />
              {errors.source && <FieldError>{errors.source.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.destination)}>
              <FieldLabel htmlFor="destination">Destination</FieldLabel>
              <Input
                id="destination"
                placeholder="Ahmedabad Hub"
                aria-invalid={Boolean(errors.destination)}
                {...register("destination")}
              />
              {errors.destination && (
                <FieldError>{errors.destination.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.vehicleId)}>
              <FieldLabel htmlFor="vehicleId">Vehicle (available only)</FieldLabel>
              <Controller
                name="vehicleId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="vehicleId" className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableVehicles.length === 0 ? (
                        <SelectItem disabled value="none">
                          No vehicles available
                        </SelectItem>
                      ) : (
                        selectableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.registrationNumber} —{" "}
                            {Number(vehicle.maxLoadCapacity).toLocaleString()} kg
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.vehicleId && <FieldError>{errors.vehicleId.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.driverId)}>
              <FieldLabel htmlFor="driverId">Driver (available only)</FieldLabel>
              <Controller
                name="driverId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="driverId" className="w-full">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableDrivers.length === 0 ? (
                        <SelectItem disabled value="none">
                          No drivers available
                        </SelectItem>
                      ) : (
                        selectableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={String(driver.id)}>
                            {driver.name} — {driver.licenseCategory}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.driverId && <FieldError>{errors.driverId.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.cargoWeight) || overloadBy > 0}>
              <FieldLabel htmlFor="cargoWeight">Cargo weight (kg)</FieldLabel>
              <Input
                id="cargoWeight"
                type="number"
                step="0.01"
                placeholder="450"
                aria-invalid={Boolean(errors.cargoWeight) || overloadBy > 0}
                {...register("cargoWeight")}
              />
              {errors.cargoWeight && <FieldError>{errors.cargoWeight.message}</FieldError>}
              {capacity !== null && overloadBy === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Capacity: {capacity.toLocaleString()} kg
                </p>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.plannedDistance)}>
              <FieldLabel htmlFor="plannedDistance">Planned distance (km)</FieldLabel>
              <Input
                id="plannedDistance"
                type="number"
                step="0.01"
                placeholder="38"
                {...register("plannedDistance")}
              />
              {errors.plannedDistance && (
                <FieldError>{errors.plannedDistance.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.revenue)} className="md:col-span-2">
              <FieldLabel htmlFor="revenue">Expected revenue</FieldLabel>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                placeholder="12000"
                {...register("revenue")}
              />
              {errors.revenue && <FieldError>{errors.revenue.message}</FieldError>}
            </Field>
          </div>

          {/* The mandatory rule, shown before you can hit save. */}
          {overloadBy > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger-muted p-3 text-sm text-danger"
            >
              <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">
                  Capacity exceeded by {overloadBy.toLocaleString()} kg
                </p>
                <p className="text-xs">
                  {selectedVehicle.registrationNumber} carries{" "}
                  {capacity.toLocaleString()} kg. Reduce the load or pick a larger
                  vehicle.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || overloadBy > 0}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TripDialog;
