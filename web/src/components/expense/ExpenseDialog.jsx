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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";

/** Mirrors expenseTypeEnum in server/src/db/schema.js */
const EXPENSE_TYPES = [
  { value: "toll", label: "Toll" },
  { value: "parking", label: "Parking" },
  { value: "permit", label: "Permit" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional(),
  type: z.enum(
    EXPENSE_TYPES.map((item) => item.value),
    { message: "Select an expense type" },
  ),
  description: z.string().max(250, "Max 250 characters").optional(),
  amount: z.coerce
    .number({ message: "Amount must be a number" })
    .positive("Must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  vehicleId: "",
  tripId: "",
  type: "",
  description: "",
  amount: "",
  date: today(),
};

const toFormValues = (expense) => ({
  vehicleId: expense.vehicleId ? String(expense.vehicleId) : "",
  tripId: expense.tripId ? String(expense.tripId) : "",
  type: expense.type ?? "",
  description: expense.description ?? "",
  amount: expense.amount ? Number(expense.amount) : "",
  date: expense.date ? String(expense.date).slice(0, 10) : today(),
});

const ExpenseDialog = ({ open, onOpenChange, expense, onSubmit, isPending }) => {
  const isEdit = Boolean(expense);

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
    if (open) reset(expense ? toFormValues(expense) : EMPTY);
  }, [open, expense, reset]);

  const selectedVehicleId = watch("vehicleId");

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
          <DialogTitle>{isEdit ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            Tolls, parking, permits, and anything else charged against a vehicle.
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

            <Field data-invalid={Boolean(errors.type)}>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <FieldError>{errors.type.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.amount)}>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="120"
                aria-invalid={Boolean(errors.amount)}
                {...register("amount")}
              />
              {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
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

            <Field
              data-invalid={Boolean(errors.description)}
              className="md:col-span-2"
            >
              <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
              <Textarea
                id="description"
                rows={2}
                placeholder="NH-48 toll"
                {...register("description")}
              />
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
