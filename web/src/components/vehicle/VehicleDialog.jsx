import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyVehicle = {
  plateNumber: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  status: "Active",
  mileage: 0,
  fuelType: "Diesel",
  assignedDriver: "",
  department: "Operations",
  lastService: "",
  nextService: "",
  notes: "",
};

const VehicleDialog = ({ open, onOpenChange, mode = "add", vehicle, onSubmit }) => {
  const [formState, setFormState] = useState(emptyVehicle);

  useEffect(() => {
    if (vehicle) {
      setFormState({
        ...emptyVehicle,
        ...vehicle,
      });
    } else {
      setFormState(emptyVehicle);
    }
  }, [vehicle, open]);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ ...formState, year: Number(formState.year), mileage: Number(formState.mileage) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-black/10 bg-white p-0">
        <DialogHeader className="border-b border-black/10 p-6">
          <DialogTitle>{mode === "edit" ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          <DialogDescription>
            Capture the key details for the vehicle record in a simple, structured form.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Plate number</label>
              <Input value={formState.plateNumber} onChange={(event) => handleChange("plateNumber", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Make</label>
              <Input value={formState.make} onChange={(event) => handleChange("make", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Model</label>
              <Input value={formState.model} onChange={(event) => handleChange("model", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Year</label>
              <Input type="number" value={formState.year} onChange={(event) => handleChange("year", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select value={formState.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="w-full border-black/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Idle">Idle</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Mileage</label>
              <Input type="number" value={formState.mileage} onChange={(event) => handleChange("mileage", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Fuel type</label>
              <Input value={formState.fuelType} onChange={(event) => handleChange("fuelType", event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Assigned driver</label>
              <Input value={formState.assignedDriver} onChange={(event) => handleChange("assignedDriver", event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Department</label>
              <Select value={formState.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger className="w-full border-black/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Shuttle">Shuttle</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="City">City</SelectItem>
                  <SelectItem value="Fleet">Fleet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Last service</label>
              <Input type="date" value={formState.lastService} onChange={(event) => handleChange("lastService", event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Next service</label>
              <Input type="date" value={formState.nextService} onChange={(event) => handleChange("nextService", event.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Notes</label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
              value={formState.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
            />
          </div>

          <DialogFooter className="border-t border-black/10 px-0 pt-4">
            <Button type="button" variant="outline" className="border-black text-black" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" className="border border-black bg-black text-white hover:bg-black/90">
              {mode === "edit" ? "Save changes" : "Create vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDialog;
