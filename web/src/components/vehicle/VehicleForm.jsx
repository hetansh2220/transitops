import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaultVehicle = {
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

const VehicleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formState, setFormState] = useState(initialData ?? defaultVehicle);

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ ...formState, year: Number(formState.year), mileage: Number(formState.mileage) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-black/10 bg-white p-5">
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
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" className="border-black text-black" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="border border-black bg-black text-white hover:bg-black/90">
          Save vehicle
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
