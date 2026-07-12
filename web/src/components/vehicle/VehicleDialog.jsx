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

// Mirrors the validation in server/src/controllers/vehicleController.js.
const schema = z.object({
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .max(20, "Must be 20 characters or fewer"),
  name: z.string().min(1, "Name is required").max(100, "Must be 100 characters or fewer"),
  model: z.string().max(100, "Must be 100 characters or fewer").optional(),
  type: z.string().min(1, "Type is required").max(50, "Must be 50 characters or fewer"),
  region: z.string().max(50, "Must be 50 characters or fewer").optional(),
  maxLoadCapacity: z.coerce
    .number({ message: "Enter a number" })
    .positive("Must be greater than 0"),
  odometer: z.coerce.number({ message: "Enter a number" }).min(0, "Cannot be negative"),
  acquisitionCost: z.union([
    z.literal(""),
    z.coerce.number({ message: "Enter a number" }).min(0, "Cannot be negative"),
  ]),
});

const EMPTY = {
  registrationNumber: "",
  name: "",
  model: "",
  type: "",
  region: "",
  maxLoadCapacity: "",
  odometer: 0,
  acquisitionCost: "",
};

/** The API returns numerics as strings ("18420.00") — feed the form plain values. */
const toFormValues = (vehicle) => ({
  registrationNumber: vehicle.registrationNumber ?? "",
  name: vehicle.name ?? "",
  model: vehicle.model ?? "",
  type: vehicle.type ?? "",
  region: vehicle.region ?? "",
  maxLoadCapacity: Number(vehicle.maxLoadCapacity ?? 0),
  odometer: Number(vehicle.odometer ?? 0),
  acquisitionCost: vehicle.acquisitionCost ? Number(vehicle.acquisitionCost) : "",
});

const VehicleDialog = ({ open, onOpenChange, vehicle, onSubmit, isPending }) => {
  const isEdit = Boolean(vehicle);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(vehicle ? toFormValues(vehicle) : EMPTY);
  }, [open, vehicle, reset]);

  const submit = (values) => {
    // Drop blank optionals rather than sending "" to a numeric/varchar column.
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== "" && value !== undefined),
    );
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this vehicle."
              : "Register a new vehicle in the fleet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.registrationNumber)}>
              <FieldLabel htmlFor="registrationNumber">Registration number</FieldLabel>
              <Input
                id="registrationNumber"
                placeholder="TO-VAN-05"
                aria-invalid={Boolean(errors.registrationNumber)}
                {...register("registrationNumber")}
              />
              {errors.registrationNumber && (
                <FieldError>{errors.registrationNumber.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="Van-05"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.model)}>
              <FieldLabel htmlFor="model">Model</FieldLabel>
              <Input id="model" placeholder="Force Traveller" {...register("model")} />
              {errors.model && <FieldError>{errors.model.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.type)}>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <Input
                id="type"
                placeholder="Van"
                aria-invalid={Boolean(errors.type)}
                {...register("type")}
              />
              {errors.type && <FieldError>{errors.type.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.region)}>
              <FieldLabel htmlFor="region">Region</FieldLabel>
              <Input id="region" placeholder="West" {...register("region")} />
              {errors.region && <FieldError>{errors.region.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.maxLoadCapacity)}>
              <FieldLabel htmlFor="maxLoadCapacity">Max load capacity (kg)</FieldLabel>
              <Input
                id="maxLoadCapacity"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.maxLoadCapacity)}
                {...register("maxLoadCapacity")}
              />
              {errors.maxLoadCapacity && (
                <FieldError>{errors.maxLoadCapacity.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.odometer)}>
              <FieldLabel htmlFor="odometer">Odometer (km)</FieldLabel>
              <Input
                id="odometer"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.odometer)}
                {...register("odometer")}
              />
              {errors.odometer && <FieldError>{errors.odometer.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.acquisitionCost)}>
              <FieldLabel htmlFor="acquisitionCost">Acquisition cost</FieldLabel>
              <Input
                id="acquisitionCost"
                type="number"
                step="0.01"
                placeholder="Optional"
                {...register("acquisitionCost")}
              />
              {errors.acquisitionCost && (
                <FieldError>{errors.acquisitionCost.message}</FieldError>
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Create vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDialog;
