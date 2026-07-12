import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import VehicleStatusBadge from "@/components/vehicle/VehicleStatusBadge";

const VehicleDetailsSheet = ({ open, onOpenChange, vehicle }) => {
  if (!vehicle) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg border-l border-black/10 bg-white p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-black/10 p-6">
          <SheetTitle className="text-xl">{vehicle.plateNumber}</SheetTitle>
          <SheetDescription>
            {vehicle.make} {vehicle.model} • {vehicle.year}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">Fleet asset</p>
              <h3 className="mt-2 text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
            </div>
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="grid gap-4 border border-black/10 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Plate number</p>
              <p className="mt-1 font-medium">{vehicle.plateNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Fuel type</p>
              <p className="mt-1 font-medium">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Mileage</p>
              <p className="mt-1 font-medium">{vehicle.mileage.toLocaleString()} mi</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Assigned driver</p>
              <p className="mt-1 font-medium">{vehicle.assignedDriver}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Department</p>
              <p className="mt-1 font-medium">{vehicle.department}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/60">Last service</p>
              <p className="mt-1 font-medium">{vehicle.lastService}</p>
            </div>
          </div>

          <div className="border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-black/60">Notes</p>
            <p className="mt-3 text-sm leading-6 text-black/75">{vehicle.notes}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VehicleDetailsSheet;
