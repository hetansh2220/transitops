import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleStatusBadge from "@/components/vehicle/VehicleStatusBadge";

const vehicles = [
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
];

const VehicleDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const vehicle = useMemo(() => {
    const numericId = Number(id);
    return vehicles.find((item) => item.id === numericId) ?? vehicles[0];
  }, [id]);

  return (
    <div className="min-h-screen bg-white p-4 text-black sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between border border-black/10 bg-white p-4 shadow-sm">
          <Button variant="outline" onClick={() => navigate(-1)} className="border-black text-black">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-black/60">Vehicle profile</p>
            <p className="text-sm font-medium">{vehicle.plateNumber}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/60">Fleet asset</p>
                <h1 className="mt-2 text-2xl font-semibold">{vehicle.make} {vehicle.model}</h1>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </div>

            <dl className="mt-6 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Plate number</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.plateNumber}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Year</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.year}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Mileage</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.mileage.toLocaleString()} mi</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Fuel type</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.fuelType}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Assigned driver</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.assignedDriver}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-black/60">Department</dt>
                <dd className="mt-1 text-sm font-medium">{vehicle.department}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-4">
            <div className="border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">Service schedule</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="border-b border-black/10 pb-3">
                  <p className="text-black/60">Last service</p>
                  <p className="mt-1 font-medium">{vehicle.lastService}</p>
                </div>
                <div>
                  <p className="text-black/60">Next service</p>
                  <p className="mt-1 font-medium">{vehicle.nextService}</p>
                </div>
              </div>
            </div>
            <div className="border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">Notes</p>
              <p className="mt-3 text-sm leading-6 text-black/75">{vehicle.notes}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
