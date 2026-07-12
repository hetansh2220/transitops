import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useTrips } from "@/hooks/useTrips";

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional(),
  liters: z.coerce
    .number({ message: "Litres must be a number" })
    .positive("Must be greater than 0"),
  cost: z.coerce
    .number({ message: "Cost must be a number" })
    .positive("Must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  vehicleId: "",
  tripId: "",
  liters: "",
  cost: "",
  date: today(),
};

const toFormValues = (log) => ({
  vehicleId: log.vehicleId ? String(log.vehicleId) : "",
  tripId: log.tripId ? String(log.tripId) : "",
  liters: log.liters ? Number(log.liters) : "",
  cost: log.cost ? Number(log.cost) : "",
  date: log.date ? String(log.date).slice(0, 10) : today(),
});

const FuelDialog = ({ open, onOpenChange, log, onSubmit, isPending }) => {
  const isEdit = Boolean(log);

  const { data: vehicles = [] } = useVehicles();
  const { data: trips = [] } = useTrips();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(log ? toFormValues(log) : EMPTY);
  }, [open, log, reset]);

  const selectedVehicleId = watch("vehicleId");

  // Fuel is only ever burned on a trip the vehicle actually ran.
  const relevantTrips = useMemo(
    () =>
      trips.filter(
        (trip) =>
          String(trip.vehicleId) === selectedVehicleId &&
          (trip.status === "dispatched" || trip.status === "completed"),
      ),
    [trips, selectedVehicleId],
  );

  const submit = (values) =>
    onSubmit({ ...values, tripId: values.tripId ? Number(values.tripId) : null });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit fuel log" : "Log fuel purchase"}</DialogTitle>
          <DialogDescription>
            Record litres and cost against a vehicle, and optionally the trip that
            burned them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.vehicleId)}>
              <FieldLabel htmlFor="vehicleId">Vehicle</FieldLabel>
              <Controller
                name="vehicleId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // The old trip belongs to the old vehicle — clear it.
                      setValue("tripId", "");
                    }}
                    value={field.value}
                  >
                    <SelectTrigger id="vehicleId" className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.registrationNumber} — {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.vehicleId && <FieldError>{errors.vehicleId.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.tripId)}>
              <FieldLabel htmlFor="tripId">Trip (optional)</FieldLabel>
              <Controller
                name="tripId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedVehicleId}
                  >
                    <SelectTrigger id="tripId" className="w-full">
                      <SelectValue
                        placeholder={
                          selectedVehicleId ? "Select trip" : "Select a vehicle first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantTrips.length === 0 ? (
                        <SelectItem disabled value="none">
                          No dispatched or completed trips
                        </SelectItem>
                      ) : (
                        relevantTrips.map((trip) => (
                          <SelectItem key={trip.id} value={String(trip.id)}>
                            #{trip.id} — {trip.source} → {trip.destination}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tripId && <FieldError>{errors.tripId.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.liters)}>
              <FieldLabel htmlFor="liters">Volume (litres)</FieldLabel>
              <Input
                id="liters"
                type="number"
                step="0.01"
                placeholder="50"
                aria-invalid={Boolean(errors.liters)}
                {...register("liters")}
              />
              {errors.liters && <FieldError>{errors.liters.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.cost)}>
              <FieldLabel htmlFor="cost">Total cost</FieldLabel>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="3150"
                aria-invalid={Boolean(errors.cost)}
                {...register("cost")}
              />
              {errors.cost && <FieldError>{errors.cost.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.date)} className="md:col-span-2">
              <FieldLabel htmlFor="date">Refuel date</FieldLabel>
              <Input
                id="date"
                type="date"
                aria-invalid={Boolean(errors.date)}
                {...register("date")}
              />
              {errors.date && <FieldError>{errors.date.message}</FieldError>}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Log fuel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FuelDialog;
