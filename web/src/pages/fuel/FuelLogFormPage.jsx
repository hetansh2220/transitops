import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { useFuelLog, useCreateFuelLog, useUpdateFuelLog } from "@/hooks/useFuelLogs";

const schema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional(),
  liters: z.coerce
    .number({ message: "Liters must be a number" })
    .positive("Must be greater than 0"),
  cost: z.coerce
    .number({ message: "Cost must be a number" })
    .positive("Must be greater than 0"),
  date: z.string().min(1, "Date is required"),
});

const EMPTY = {
  vehicleId: "",
  tripId: "",
  liters: "",
  cost: "",
  date: new Date().toISOString().slice(0, 10),
};

const FuelLogFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const createFuelLog = useCreateFuelLog();
  const updateFuelLog = useUpdateFuelLog();

  const { data: vehicles = [] } = useVehicles();
  const { data: trips = [] } = useTrips();

  const { data: logData, isLoading: loadingLog } = useFuelLog(id);

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
    if (isEdit && logData) {
      reset({
        vehicleId: logData.vehicleId ? String(logData.vehicleId) : "",
        tripId: logData.tripId ? String(logData.tripId) : "",
        liters: logData.liters ? Number(logData.liters) : "",
        cost: logData.cost ? Number(logData.cost) : "",
        date: logData.date ? new Date(logData.date).toISOString().slice(0, 10) : "",
      });
    }
  }, [isEdit, logData, reset]);

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
      ? updateFuelLog.mutateAsync({ id: Number(id), ...payload })
      : createFuelLog.mutateAsync(payload);

    action.then(() => navigate("/fuel")).catch(() => {});
  };

  if (isEdit && loadingLog) {
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
          {isEdit ? `Edit Fuel Log #${id}` : "Log Fuel Purchase"}
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

          <Field data-invalid={Boolean(errors.liters)}>
            <FieldLabel htmlFor="liters">Volume (Liters)</FieldLabel>
            <Input
              id="liters"
              type="number"
              step="0.01"
              placeholder="e.g. 50"
              aria-invalid={Boolean(errors.liters)}
              {...register("liters")}
            />
            {errors.liters && <FieldError>{errors.liters.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.cost)}>
            <FieldLabel htmlFor="cost">Total Cost ($)</FieldLabel>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="e.g. 110"
              aria-invalid={Boolean(errors.cost)}
              {...register("cost")}
            />
            {errors.cost && <FieldError>{errors.cost.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.date)} className="md:col-span-2">
            <FieldLabel htmlFor="date">Refuel Date</FieldLabel>
            <Input
              id="date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
            {errors.date && <FieldError>{errors.date.message}</FieldError>}
          </Field>
        </div>

        <div className="flex gap-4 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/fuel")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isEdit ? updateFuelLog.isPending : createFuelLog.isPending}>
            {isEdit
              ? updateFuelLog.isPending
                ? "Updating…"
                : "Update Fuel Log"
              : createFuelLog.isPending
              ? "Logging…"
              : "Log Fuel"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FuelLogFormPage;
