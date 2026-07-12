import { useEffect, useState, useMemo } from "react";
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
import { useDrivers } from "@/hooks/useDrivers";
import { useTrip, useCreateTrip, useUpdateTrip } from "@/hooks/useTrips";

const schema = z.object({
  source: z.string().min(1, "Source is required").max(150, "Max 150 characters"),
  destination: z
    .string()
    .min(1, "Destination is required")
    .max(150, "Max 150 characters"),
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

const TripFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();

  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();

  const { data: tripData, isLoading: loadingTrip } = useTrip(id);

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

  useEffect(() => {
    if (isEdit && tripData) {
      reset({
        source: tripData.source || "",
        destination: tripData.destination || "",
        vehicleId: tripData.vehicleId ? String(tripData.vehicleId) : "",
        driverId: tripData.driverId ? String(tripData.driverId) : "",
        cargoWeight: tripData.cargoWeight ? String(tripData.cargoWeight) : "",
        plannedDistance: tripData.plannedDistance ? String(tripData.plannedDistance) : "",
        revenue: tripData.revenue ? String(tripData.revenue) : "",
      });
    }
  }, [isEdit, tripData, reset]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter(
      (v) =>
        v.status === "available" ||
        (tripData && String(v.id) === String(tripData.vehicleId))
    );
  }, [vehicles, tripData]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(
      (d) =>
        d.status === "available" ||
        (tripData && String(d.id) === String(tripData.driverId))
    );
  }, [drivers, tripData]);

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicles.find((v) => String(v.id) === selectedVehicleId);
  }, [selectedVehicleId, vehicles]);

  const submit = (values) => {
    if (selectedVehicle && Number(values.cargoWeight) > Number(selectedVehicle.maxLoadCapacity)) {
      alert(
        `Cargo weight (${values.cargoWeight} kg) exceeds maximum load capacity for ${selectedVehicle.registrationNumber} (${selectedVehicle.maxLoadCapacity} kg)`
      );
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    );

    payload.vehicleId = Number(payload.vehicleId);
    payload.driverId = Number(payload.driverId);
    payload.cargoWeight = Number(payload.cargoWeight);
    if (payload.plannedDistance !== null) payload.plannedDistance = Number(payload.plannedDistance);
    if (payload.revenue !== null) payload.revenue = Number(payload.revenue);

    const action = isEdit
      ? updateTrip.mutateAsync({ id: Number(id), ...payload })
      : createTrip.mutateAsync(payload);

    action.then(() => navigate("/trips")).catch(() => {});
  };

  if (isEdit && loadingTrip) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full" />
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
          {isEdit ? `Edit Trip #${id}` : "Create Trip"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-lg border border-border p-6" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={Boolean(errors.source)}>
            <FieldLabel htmlFor="source">Source Location</FieldLabel>
            <Input
              id="source"
              placeholder="e.g. Mumbai Port"
              aria-invalid={Boolean(errors.source)}
              {...register("source")}
            />
            {errors.source && <FieldError>{errors.source.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.destination)}>
            <FieldLabel htmlFor="destination">Destination Location</FieldLabel>
            <Input
              id="destination"
              placeholder="e.g. Delhi Depot"
              aria-invalid={Boolean(errors.destination)}
              {...register("destination")}
            />
            {errors.destination && <FieldError>{errors.destination.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.vehicleId)}>
            <FieldLabel htmlFor="vehicleId">Vehicle</FieldLabel>
            <Controller
              name="vehicleId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="vehicleId" className="w-full">
                    <SelectValue placeholder="Select available vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.length === 0 ? (
                      <SelectItem disabled value="none">
                        No vehicles available
                      </SelectItem>
                    ) : (
                      availableVehicles.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.registrationNumber} ({v.name} - Max: {Number(v.maxLoadCapacity).toLocaleString()} kg)
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
            <FieldLabel htmlFor="driverId">Driver</FieldLabel>
            <Controller
              name="driverId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="driverId" className="w-full">
                    <SelectValue placeholder="Select available driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.length === 0 ? (
                      <SelectItem disabled value="none">
                        No drivers available
                      </SelectItem>
                    ) : (
                      availableDrivers.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name} (License Category: {d.licenseCategory})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.driverId && <FieldError>{errors.driverId.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.cargoWeight)}>
            <FieldLabel htmlFor="cargoWeight">Cargo Weight (kg)</FieldLabel>
            <Input
              id="cargoWeight"
              type="number"
              step="0.01"
              placeholder="e.g. 5000"
              aria-invalid={Boolean(errors.cargoWeight)}
              {...register("cargoWeight")}
            />
            {errors.cargoWeight && <FieldError>{errors.cargoWeight.message}</FieldError>}
            {selectedVehicle && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Vehicle max load limit: {Number(selectedVehicle.maxLoadCapacity).toLocaleString()} kg
              </p>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.plannedDistance)}>
            <FieldLabel htmlFor="plannedDistance">Planned Distance (km)</FieldLabel>
            <Input
              id="plannedDistance"
              type="number"
              step="0.01"
              placeholder="e.g. 1400"
              aria-invalid={Boolean(errors.plannedDistance)}
              {...register("plannedDistance")}
            />
            {errors.plannedDistance && <FieldError>{errors.plannedDistance.message}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.revenue)}>
            <FieldLabel htmlFor="revenue">Expected Revenue ($)</FieldLabel>
            <Input
              id="revenue"
              type="number"
              step="0.01"
              placeholder="e.g. 2500"
              aria-invalid={Boolean(errors.revenue)}
              {...register("revenue")}
            />
            {errors.revenue && <FieldError>{errors.revenue.message}</FieldError>}
          </Field>
        </div>

        <div className="flex gap-4 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/trips")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isEdit ? updateTrip.isPending : createTrip.isPending}>
            {isEdit
              ? updateTrip.isPending
                ? "Updating Draft…"
                : "Update Draft"
              : createTrip.isPending
              ? "Creating Draft…"
              : "Create Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TripFormPage;
