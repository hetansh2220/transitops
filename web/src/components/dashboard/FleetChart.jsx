import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from "@/constants/vehicleStatus";

const COLORS = {
  [VEHICLE_STATUS.AVAILABLE]: "#10b981",
  [VEHICLE_STATUS.ON_TRIP]: "#3b82f6",
  [VEHICLE_STATUS.IN_SHOP]: "#f59e0b",
  [VEHICLE_STATUS.RETIRED]: "#fb7185",
};

const FleetChart = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return <Skeleton className="h-72 w-full" />;
  }

  const rows = [
    { status: VEHICLE_STATUS.AVAILABLE, count: data.vehicles.available },
    { status: VEHICLE_STATUS.ON_TRIP, count: data.vehicles.active },
    { status: VEHICLE_STATUS.IN_SHOP, count: data.vehicles.inMaintenance },
    { status: VEHICLE_STATUS.RETIRED, count: data.vehicles.retired },
  ].map((row) => ({ ...row, label: VEHICLE_STATUS_LABELS[row.status] }));

  return (
    <div className="rounded-lg border border-border p-5">
      <h2 className="text-sm font-semibold">Vehicle status</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {data.vehicles.total} vehicles in the fleet
      </p>

      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={84}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "rgba(127,127,127,0.12)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--popover-foreground)",
              }}
            />
            <Bar dataKey="count" name="Vehicles" radius={[0, 4, 4, 0]} barSize={18}>
              {rows.map((row) => (
                <Cell key={row.status} fill={COLORS[row.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FleetChart;
