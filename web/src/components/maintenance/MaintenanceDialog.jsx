import { useEffect } from "react";
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
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_LABELS,
} from "@/constants/maintenanceStatus";
import { VEHICLE_STATUS } from "@/constants/vehicleStatus";

const schema = z.object({
  vehicleId: z.string().min(1, "Select a vehicle"),
  serviceType: z.string().min(1, "Service type is required").max(100),
  cost: z.coerce.number({ message: "Enter a number" }).min(0, "Cannot be negative"),
  date: z.string().min(1, "Date is required"),
  status: z.enum([MAINTENANCE_STATUS.OPEN, MAINTENANCE_STATUS.CLOSED]),
});

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  vehicleId: "",
  serviceType: "",
  cost: 0,
  date: today(),
  status: MAINTENANCE_STATUS.OPEN,
};

const MaintenanceDialog = ({ open, onOpenChange, vehicles, onSubmit, isPending }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const selectedId = watch("vehicleId");
  const status = watch("status");
  const selected = vehicles.find((vehicle) => String(vehicle.id) === selectedId);

  // The API refuses to open a log against a vehicle that's mid-trip.
  const blockedByTrip =
    selected?.status === VEHICLE_STATUS.ON_TRIP && status === MAINTENANCE_STATUS.OPEN;

  const submit = (values) =>
    onSubmit({ ...values, vehicleId: Number(values.vehicleId) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log service record</DialogTitle>
          <DialogDescription>
            An open record sends the vehicle to the shop and removes it from the
            dispatch pool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Field data-invalid={Boolean(errors.vehicleId)}>
            <FieldLabel htmlFor="vehicleId">Vehicle</FieldLabel>
            <Controller
              name="vehicleId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="vehicleId" className="w-full">
                    <SelectValue placeholder="Select a vehicle" />
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

          <Field data-invalid={Boolean(errors.serviceType)}>
            <FieldLabel htmlFor="serviceType">Service type</FieldLabel>
            <Input
              id="serviceType"
              placeholder="Oil change"
              aria-invalid={Boolean(errors.serviceType)}
              {...register("serviceType")}
            />
            {errors.serviceType && <FieldError>{errors.serviceType.message}</FieldError>}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.cost)}>
              <FieldLabel htmlFor="cost">Cost</FieldLabel>
              <Input
                id="cost"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.cost)}
                {...register("cost")}
              />
              {errors.cost && <FieldError>{errors.cost.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.date)}>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <Input
                id="date"
                type="date"
                aria-invalid={Boolean(errors.date)}
                {...register("date")}
              />
              {errors.date && <FieldError>{errors.date.message}</FieldError>}
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.status)}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MAINTENANCE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <FieldError>{errors.status.message}</FieldError>}
          </Field>

          {blockedByTrip && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {selected.registrationNumber} is on a trip. Complete or cancel the trip
              before opening maintenance.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || blockedByTrip}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceDialog;
