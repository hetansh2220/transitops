import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from "@/constants/vehicleStatus";
import { TONE, TONE_HEX } from "@/lib/statusTone";

// Same tone mapping as VehicleStatusBadge, so the chart and the table agree.
const TONES = {
  [VEHICLE_STATUS.AVAILABLE]: TONE.SUCCESS,
  [VEHICLE_STATUS.ON_TRIP]: TONE.INFO,
  [VEHICLE_STATUS.IN_SHOP]: TONE.WARNING,
  [VEHICLE_STATUS.RETIRED]: TONE.NEUTRAL,
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
  ].map((row) => ({
    ...row,
    label: VEHICLE_STATUS_LABELS[row.status],
    // Per-row fill, so each bar carries its status tone without <Cell>.
    fill: TONE_HEX[TONES[row.status]],
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-medium">Vehicle status</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {data.vehicles.total} vehicles in the fleet
      </p>

      <div className="mt-6 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 12 }}>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={78}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            <Bar dataKey="count" name="Vehicles" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FleetChart;
