import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import VehicleStatusBadge from "@/components/vehicle/VehicleStatusBadge";

const Row = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value ?? "—"}</p>
  </div>
);

const number = (value) =>
  value === null || value === undefined ? null : Number(value).toLocaleString();

const VehicleDetailsSheet = ({ open, onOpenChange, vehicle }) => {
  if (!vehicle) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl">{vehicle.registrationNumber}</SheetTitle>
          <SheetDescription>
            {[vehicle.name, vehicle.model].filter(Boolean).join(" • ")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Current status</p>
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Type" value={vehicle.type} />
            <Row label="Region" value={vehicle.region} />
            <Row
              label="Max load capacity"
              value={number(vehicle.maxLoadCapacity) && `${number(vehicle.maxLoadCapacity)} kg`}
            />
            <Row
              label="Odometer"
              value={number(vehicle.odometer) && `${number(vehicle.odometer)} km`}
            />
            <Row label="Acquisition cost" value={number(vehicle.acquisitionCost)} />
            <Row
              label="Added"
              value={
                vehicle.createdAt
                  ? new Date(vehicle.createdAt).toLocaleDateString()
                  : null
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VehicleDetailsSheet;
