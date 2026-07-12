import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VehicleDialog from "@/components/vehicle/VehicleDialog";
import VehicleDetailsSheet from "@/components/vehicle/VehicleDetailsSheet";
import VehicleFilters from "@/components/vehicle/VehicleFilters";
import VehicleTable from "@/components/vehicle/VehicleTable";

const initialVehicles = [
  {
    id: 1,
    plateNumber: "TX-2048",
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2022,
    status: "Active",
    mileage: 18420,
    fuelType: "Diesel",
    assignedDriver: "Daniel Brooks",
    department: "Operations",
    lastService: "2026-06-14",
    nextService: "2026-09-14",
    notes: "Excellent route reliability and clean cabin.",
  },
  {
    id: 2,
    plateNumber: "TX-4410",
    make: "Ford",
    model: "Transit Connect",
    year: 2021,
    status: "Maintenance",
    mileage: 29140,
    fuelType: "Gasoline",
    assignedDriver: "Maya Chen",
    department: "Shuttle",
    lastService: "2026-05-11",
    nextService: "2026-08-11",
    notes: "Brake inspection scheduled this week.",
  },
  {
    id: 3,
    plateNumber: "TX-1187",
    make: "Volvo",
    model: "9700",
    year: 2020,
    status: "Active",
    mileage: 61203,
    fuelType: "Diesel",
    assignedDriver: "Alex Rivera",
    department: "Regional",
    lastService: "2026-06-24",
    nextService: "2026-09-24",
    notes: "High-capacity coach with premium comfort package.",
  },
  {
    id: 4,
    plateNumber: "TX-9931",
    make: "Chevrolet",
    model: "Express",
    year: 2019,
    status: "Idle",
    mileage: 47610,
    fuelType: "Gasoline",
    assignedDriver: "No driver",
    department: "Support",
    lastService: "2026-04-17",
    nextService: "2026-07-17",
    notes: "Ready for reassignment after maintenance.",
  },
  {
    id: 5,
    plateNumber: "TX-5533",
    make: "Toyota",
    model: "Hiace",
    year: 2023,
    status: "Active",
    mileage: 15340,
    fuelType: "Hybrid",
    assignedDriver: "Eva Mason",
    department: "City",
    lastService: "2026-06-06",
    nextService: "2026-09-06",
    notes: "Ideal for urban routes and low emissions.",
  },
  {
    id: 6,
    plateNumber: "TX-7634",
    make: "Isuzu",
    model: "N-Series",
    year: 2021,
    status: "Inactive",
    mileage: 35600,
    fuelType: "Diesel",
    assignedDriver: "No driver",
    department: "Fleet",
    lastService: "2026-03-01",
    nextService: "2026-06-01",
    notes: "Awaiting depot assignment.",
  },
];

const pageSize = 4;

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVehicles(initialVehicles);
      setLoading(false);
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !term ||
        [vehicle.plateNumber, vehicle.make, vehicle.model, vehicle.assignedDriver]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;
      const matchesType = typeFilter === "All" || vehicle.department === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));

  const pagedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const handleAddVehicle = () => {
    setDialogMode("add");
    setEditingVehicle(null);
    setDialogOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setDialogMode("edit");
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
  };

  const handleSaveVehicle = (vehicleData) => {
    if (dialogMode === "edit" && editingVehicle) {
      setVehicles((current) =>
        current.map((vehicle) => (vehicle.id === editingVehicle.id ? { ...vehicle, ...vehicleData } : vehicle))
      );
    } else {
      const nextVehicle = {
        ...vehicleData,
        id: Date.now(),
      };
      setVehicles((current) => [nextVehicle, ...current]);
    }

    setDialogOpen(false);
    setEditingVehicle(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  return (
    <div className="min-h-screen bg-white p-4 text-black sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border border-black/10 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/60">Fleet overview</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vehicle management</h1>
            <p className="mt-2 max-w-2xl text-sm text-black/70">
              Track the full vehicle lifecycle with search, filters, quick actions, and a structured details view.
            </p>
          </div>
          <Button onClick={handleAddVehicle} className="w-fit border border-black bg-black text-white hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            Add vehicle
          </Button>
        </header>

        <section className="grid gap-4 border border-black/10 bg-white p-4 shadow-sm md:grid-cols-3">
          <div className="border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">Fleet count</p>
            <p className="mt-2 text-2xl font-semibold">{vehicles.length}</p>
          </div>
          <div className="border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">Active units</p>
            <p className="mt-2 text-2xl font-semibold">{vehicles.filter((vehicle) => vehicle.status === "Active").length}</p>
          </div>
          <div className="border border-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">In maintenance</p>
            <p className="mt-2 text-2xl font-semibold">{vehicles.filter((vehicle) => vehicle.status === "Maintenance").length}</p>
          </div>
        </section>

        <section className="border border-black/10 bg-white p-4 shadow-sm">
          <VehicleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onReset={handleResetFilters}
          />
        </section>

        <section className="border border-black/10 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse border border-black/10 bg-black/[0.03]" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
              <div className="rounded-full border border-black/10 p-4">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">No vehicles found</h2>
                <p className="mt-1 text-sm text-black/70">Try a different search term or reset the filters.</p>
              </div>
              <Button onClick={handleResetFilters} variant="outline" className="border-black text-black">
                Reset filters
              </Button>
            </div>
          ) : (
            <VehicleTable
              vehicles={pagedVehicles}
              onView={(vehicle) => setSelectedVehicle(vehicle)}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </div>

      <VehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        vehicle={editingVehicle}
        onSubmit={handleSaveVehicle}
      />

      <VehicleDetailsSheet
        open={Boolean(selectedVehicle)}
        onOpenChange={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
      />
    </div>
  );
};

export default VehicleListPage;
