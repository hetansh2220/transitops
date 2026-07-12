import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

const createSchema = (startOdometer) =>
  z.object({
    endOdometer: z.coerce
      .number({ message: "Enter a valid odometer reading" })
      .min(startOdometer, `Must be at least the starting odometer (${startOdometer} km)`),
    fuelConsumed: z.union([
      z.literal(""),
      z.coerce.number({ message: "Enter a number" }).nonnegative("Cannot be negative"),
    ]),
    fuelCost: z.union([
      z.literal(""),
      z.coerce.number({ message: "Enter a number" }).nonnegative("Cannot be negative"),
    ]),
    date: z.string().optional(),
  });

const EMPTY = {
  endOdometer: "",
  fuelConsumed: "",
  fuelCost: "",
  date: new Date().toISOString().slice(0, 10),
};

const CompleteTripDialog = ({ open, onOpenChange, trip, onSubmit, isPending }) => {
  const startOdometer = trip ? Number(trip.startOdometer ?? 0) : 0;
  const schema = createSchema(startOdometer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset({
        ...EMPTY,
        endOdometer: trip?.startOdometer ? Number(trip.startOdometer) : "",
      });
    }
  }, [open, trip, reset]);

  const submit = (values) => {
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== "" && value !== undefined)
    );
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Trip</DialogTitle>
          <DialogDescription>
            Record the final details to return the vehicle and driver to available status.
          </DialogDescription>
        </DialogHeader>

        {trip && (
          <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span className="font-medium">{trip.source} → {trip.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle registration:</span>
              <span className="font-medium">{trip.vehicleRegistration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Odometer:</span>
              <span className="font-medium">{startOdometer.toLocaleString()} km</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Field data-invalid={Boolean(errors.endOdometer)}>
            <FieldLabel htmlFor="endOdometer">Final Odometer (km)</FieldLabel>
            <Input
              id="endOdometer"
              type="number"
              step="0.01"
              aria-invalid={Boolean(errors.endOdometer)}
              {...register("endOdometer")}
            />
            {errors.endOdometer && <FieldError>{errors.endOdometer.message}</FieldError>}
          </Field>

          <div className="border-t border-border pt-4 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Optional Fuel Log
            </h4>
            <div className="grid gap-4 grid-cols-2">
              <Field data-invalid={Boolean(errors.fuelConsumed)}>
                <FieldLabel htmlFor="fuelConsumed">Fuel Consumed (L)</FieldLabel>
                <Input
                  id="fuelConsumed"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 45"
                  aria-invalid={Boolean(errors.fuelConsumed)}
                  {...register("fuelConsumed")}
                />
                {errors.fuelConsumed && <FieldError>{errors.fuelConsumed.message}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.fuelCost)}>
                <FieldLabel htmlFor="fuelCost">Fuel Cost ($)</FieldLabel>
                <Input
                  id="fuelCost"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 90"
                  aria-invalid={Boolean(errors.fuelCost)}
                  {...register("fuelCost")}
                />
                {errors.fuelCost && <FieldError>{errors.fuelCost.message}</FieldError>}
              </Field>
            </div>
          </div>

          <Field data-invalid={Boolean(errors.date)}>
            <FieldLabel htmlFor="date">Completion Date</FieldLabel>
            <Input
              id="date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
            {errors.date && <FieldError>{errors.date.message}</FieldError>}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Completing…" : "Complete Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteTripDialog;
