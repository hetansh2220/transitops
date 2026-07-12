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
  DRIVER_STATUS,
  DRIVER_STATUS_LABELS,
  LICENSE_CATEGORIES,
  MANUAL_DRIVER_STATUSES,
} from "@/constants/driverStatus";

// Mirrors the validation in server/src/controllers/driverController.js.
const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  licenseNumber: z.string().min(1, "Licence number is required").max(50),
  licenseCategory: z.string().min(1, "Category is required"),
  licenseExpiryDate: z.string().min(1, "Expiry date is required"),
  contactNumber: z.string().max(20).optional(),
  safetyScore: z.coerce
    .number({ message: "Enter a number" })
    .min(0, "Must be 0–100")
    .max(100, "Must be 0–100"),
  status: z.enum(MANUAL_DRIVER_STATUSES),
});

const EMPTY = {
  name: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiryDate: "",
  contactNumber: "",
  safetyScore: 100,
  status: DRIVER_STATUS.AVAILABLE,
};

const toFormValues = (driver) => ({
  name: driver.name ?? "",
  licenseNumber: driver.licenseNumber ?? "",
  licenseCategory: driver.licenseCategory ?? "",
  licenseExpiryDate: driver.licenseExpiryDate ?? "",
  contactNumber: driver.contactNumber ?? "",
  safetyScore: Number(driver.safetyScore ?? 100),
  status: driver.status,
});

const DriverDialog = ({ open, onOpenChange, driver, onSubmit, isPending }) => {
  const isEdit = Boolean(driver);
  // 'on_trip' is owned by the trip state machine; the API rejects sending it.
  const isOnTrip = driver?.status === DRIVER_STATUS.ON_TRIP;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(driver ? toFormValues(driver) : EMPTY);
  }, [open, driver, reset]);

  const submit = (values) => {
    const payload = { ...values };
    // Sending the current status back while on_trip would 409.
    if (isOnTrip) delete payload.status;
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit driver" : "Add driver"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this driver's profile and compliance details."
              : "Register a new driver and their licence details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="Alex"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.licenseNumber)}>
              <FieldLabel htmlFor="licenseNumber">Licence number</FieldLabel>
              <Input
                id="licenseNumber"
                placeholder="DL-88213"
                aria-invalid={Boolean(errors.licenseNumber)}
                {...register("licenseNumber")}
              />
              {errors.licenseNumber && (
                <FieldError>{errors.licenseNumber.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.licenseCategory)}>
              <FieldLabel htmlFor="licenseCategory">Licence category</FieldLabel>
              <Controller
                name="licenseCategory"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="licenseCategory" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.licenseCategory && (
                <FieldError>{errors.licenseCategory.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.licenseExpiryDate)}>
              <FieldLabel htmlFor="licenseExpiryDate">Licence expiry</FieldLabel>
              <Input
                id="licenseExpiryDate"
                type="date"
                aria-invalid={Boolean(errors.licenseExpiryDate)}
                {...register("licenseExpiryDate")}
              />
              {errors.licenseExpiryDate && (
                <FieldError>{errors.licenseExpiryDate.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.contactNumber)}>
              <FieldLabel htmlFor="contactNumber">Contact number</FieldLabel>
              <Input
                id="contactNumber"
                placeholder="98765xxxxx"
                {...register("contactNumber")}
              />
              {errors.contactNumber && (
                <FieldError>{errors.contactNumber.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errors.safetyScore)}>
              <FieldLabel htmlFor="safetyScore">Safety score</FieldLabel>
              <Input
                id="safetyScore"
                type="number"
                step="0.01"
                min="0"
                max="100"
                aria-invalid={Boolean(errors.safetyScore)}
                {...register("safetyScore")}
              />
              {errors.safetyScore && (
                <FieldError>{errors.safetyScore.message}</FieldError>
              )}
            </Field>

            {!isOnTrip && (
              <Field data-invalid={Boolean(errors.status)}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANUAL_DRIVER_STATUSES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {DRIVER_STATUS_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <FieldError>{errors.status.message}</FieldError>}
              </Field>
            )}
          </div>

          {isOnTrip && (
            <p className="text-sm text-muted-foreground">
              This driver is on a trip. Their status can only change by completing or
              cancelling it.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Add driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDialog;
