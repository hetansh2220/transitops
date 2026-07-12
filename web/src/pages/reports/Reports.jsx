import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Fuel, Gauge, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVehicleReport } from "@/hooks/useReports";
import { useVehicles } from "@/hooks/useVehicles";
import { downloadVehicleReportCsv } from "@/api/reports";

const ALL = "all";

const num = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const percent = (value) =>
  value === null || value === undefined ? "—" : `${(Number(value) * 100).toFixed(1)}%`;

const chartTooltip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: 12,
    color: "var(--foreground)",
  },
};

const ReportsPage = () => {
  const [type, setType] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [downloading, setDownloading] = useState(false);

  const filters = {
    ...(type !== ALL ? { type } : {}),
    ...(region !== ALL ? { region } : {}),
  };

  const { data, isLoading, isError, error } = useVehicleReport(filters);
  const { data: vehicles = [] } = useVehicles();

  const { types, regions } = useMemo(
    () => ({
      types: [...new Set(vehicles.map((v) => v.type).filter(Boolean))].sort(),
      regions: [...new Set(vehicles.map((v) => v.region).filter(Boolean))].sort(),
    }),
    [vehicles],
  );

  const rows = data?.vehicles ?? [];
  const summary = data?.summary;

  // Revenue by vehicle, and the costliest vehicles — wireframe screen 7.
  const revenueByVehicle = useMemo(
    () =>
      [...rows]
        .filter((row) => row.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)
        .map((row) => ({ name: row.name, revenue: row.revenue })),
    [rows],
  );

  // Ranked, so the bar colour reads as severity rather than decoration.
  const costliest = useMemo(
    () =>
      [...rows]
        .filter((row) => row.totalCost > 0)
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 5)
        .map((row, index) => ({
          name: row.name,
          cost: row.totalCost,
          fill: index === 0 ? "var(--danger)" : index === 1 ? "var(--warning)" : "var(--muted-foreground)",
        })),
    [rows],
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadVehicleReportCsv(filters);
      toast.success("Report downloaded");
    } catch {
      toast.error("Could not download the report");
    } finally {
      setDownloading(false);
    }
  };

  if (isError) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t load reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.response?.data?.error ?? error.message}
        </p>
      </div>
    );
  }

  const kpis = summary
    ? [
        {
          label: "Fuel efficiency",
          value: summary.fuelEfficiency === null ? "—" : `${summary.fuelEfficiency} km/L`,
          icon: Fuel,
        },
        {
          label: "Fleet utilisation",
          value: `${summary.fleetUtilization}%`,
          icon: Gauge,
        },
        {
          label: "Operational cost",
          value: num(summary.operationalCost),
          icon: Wallet,
        },
        { label: "Fleet ROI", value: percent(summary.roi), icon: TrendingUp },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports &amp; analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ROI = (Revenue − (Maintenance + Fuel)) / Acquisition cost
          </p>
        </div>

        <Button variant="outline" onClick={handleDownload} disabled={downloading}>
          <Download size={16} aria-hidden="true" />
          {downloading ? "Preparing…" : "Export CSV"}
        </Button>
      </header>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by vehicle type">
            <SelectValue placeholder="Vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {types.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by region">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All regions</SelectItem>
            {regions.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* ── KPI cards ───────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !summary
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[88px] w-full" />
            ))
          : kpis.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon size={14} aria-hidden="true" />
                  <p className="text-xs">{label}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold font-numeric tabular-nums">{value}</p>
              </div>
            ))}
      </section>

      {/* ── Charts ──────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Revenue by vehicle</h2>
          <div className="mt-5 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : revenueByVehicle.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">
                No completed trips yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip cursor={{ fill: "var(--accent)" }} {...chartTooltip} />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Costliest vehicles</h2>
          <p className="mt-1 text-xs text-muted-foreground">Fuel + maintenance + expenses</p>
          <div className="mt-4 h-64">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : costliest.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">
                No costs recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costliest} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip cursor={{ fill: "var(--accent)" }} {...chartTooltip} />
                  <Bar
                    dataKey="cost"
                    name="Total cost"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Per-vehicle table ───────────────────────── */}
      <section className="rounded-lg border border-border">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Per-vehicle breakdown</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No vehicles match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                  <TableHead className="text-right">Fuel (L)</TableHead>
                  <TableHead className="text-right">km/L</TableHead>
                  <TableHead className="text-right">Fuel cost</TableHead>
                  <TableHead className="text-right">Maintenance</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.vehicleId}>
                    <TableCell className="font-medium">
                      {row.registrationNumber}
                      <span className="block text-xs text-muted-foreground">
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {row.completedTrips}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {num(row.distance)}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {num(row.fuelLiters)}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {row.fuelEfficiency === null ? "—" : row.fuelEfficiency}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {num(row.fuelCost)}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {num(row.maintenanceCost)}
                    </TableCell>
                    <TableCell className="text-right font-numeric tabular-nums">
                      {num(row.revenue)}
                    </TableCell>
                    <TableCell
                      className={
                        row.roi !== null && row.roi < 0
                          ? "text-right font-numeric tabular-nums text-destructive"
                          : "text-right font-numeric tabular-nums"
                      }
                    >
                      {percent(row.roi)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
