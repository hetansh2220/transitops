import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import {
  useExpense,
  useCreateExpense,
  useUpdateExpense,
} from "@/hooks/useExpenses";

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional(),
  type: z.enum(["toll", "parking", "permit", "other"], {
    message: "Select an expense type",
  }),
  description: z.string().max(250, "Max 250 characters").optional(),
  amount: z.coerce
    .number({ message: "Amount must be a number" })
    .positive("Must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

const EMPTY = {
  vehicleId: "",
  tripId: "",
  type: "",
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
};

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: vehicles = [] } = useVehicles();
  const { data: trips = [] } = useTrips();

  const { data: expense, isLoading: loadingExpense } = useExpense(id);

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const selectedVehicleId = watch("vehicleId");

  useEffect(() => {
    if (isEdit && expense) {
      reset({
        vehicleId: expense.vehicleId ? String(expense.vehicleId) : "",
        tripId: expense.tripId ? String(expense.tripId) : "",
        type: expense.type,
        description: expense.description ?? "",
        amount: expense.amount ? Number(expense.amount) : "",
        date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
      });
    }
  }, [isEdit, expense, reset]);

  const relevantTrips = useMemo(() => {
    return trips.filter(
      (t) =>
        String(t.vehicleId) === selectedVehicleId &&
        (t.status === "dispatched" || t.status === "completed")
    );
  }, [trips, selectedVehicleId]);

  const submit = (values) => {
    const payload = {
      ...values,
      tripId: values.tripId ? Number(values.tripId) : null,
    };

    const action = isEdit
      ? updateExpense.mutateAsync({ id: Number(id), ...payload })
      : createExpense.mutateAsync(payload);

    action.then(() => navigate("/expenses")).catch(() => {});
  };

  if (isEdit && loadingExpense) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEdit ? `Edit Expense #${id}` : "Log Expense"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-lg border border-border p-6" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={Boolean(errors.vehicleId)}>
            <FieldLabel htmlFor="vehicleId">Vehicle</FieldLabel>
            <Controller
              name="vehicleId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("tripId", "");
                  }}
                  value={field.value}
                >
                  <SelectTrigger id="vehicleId" className="w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.registrationNumber} ({v.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleId && <FieldError>{errors.vehicleId.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.tripId)}>
            <FieldLabel htmlFor="tripId">Associated Trip (Optional)</FieldLabel>
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
                    <SelectValue placeholder={selectedVehicleId ? "Select trip" : "Select a vehicle first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantTrips.length === 0 ? (
                      <SelectItem disabled value="none">
                        No active/completed trips found
                      </SelectItem>
                    ) : (
                      relevantTrips.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          Trip #{t.id} ({t.source} → {t.destination})
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
            <FieldLabel htmlFor="type">Expense Type</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toll">Toll</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <FieldError>{errors.type.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.amount)}>
            <FieldLabel htmlFor="amount">Amount ($)</FieldLabel>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g. 25.50"
              aria-invalid={Boolean(errors.amount)}
              {...register("amount")}
            />
            {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.date)} className="md:col-span-2">
            <FieldLabel htmlFor="date">Expense Date</FieldLabel>
            <Input
              id="date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
            {errors.date && <FieldError>{errors.date.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.description)} className="md:col-span-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="Provide a brief explanation of the expense..."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>
        </div>

        <div className="flex gap-4 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/expenses")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isEdit ? updateExpense.isPending : createExpense.isPending}>
            {isEdit
              ? updateExpense.isPending
                ? "Updating…"
                : "Update Expense"
              : createExpense.isPending
              ? "Logging…"
              : "Log Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormPage;
