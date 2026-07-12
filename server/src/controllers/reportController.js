import db from '../config/db.js';
import { vehicles, trips, fuelLogs, maintenanceLogs, expenses } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const num = (value) => Number(value ?? 0);
const round = (value) => Number(value.toFixed(2));

// Builds a vehicleId -> aggregate map so the per-vehicle rows can be assembled
// with plain lookups instead of one query per vehicle.
const byVehicle = (rows) => {
    const map = new Map();
    for (const row of rows) map.set(row.vehicleId, row);
    return map;
};

const buildReport = async ({ type, region }) => {
    const filters = [];
    if (type) filters.push(eq(vehicles.type, type));
    if (region) filters.push(eq(vehicles.region, region));

    const fleet = filters.length
        ? await db
              .select()
              .from(vehicles)
              .where(filters.length === 1 ? filters[0] : and(...filters))
        : await db.select().from(vehicles);

    // Only completed trips have produced revenue and distance.
    const tripAgg = byVehicle(
        await db
            .select({
                vehicleId: trips.vehicleId,
                distance: sql`coalesce(sum(${trips.actualDistance}), 0)`,
                revenue: sql`coalesce(sum(${trips.revenue}), 0)`,
                completedTrips: sql`count(*)`,
            })
            .from(trips)
            .where(eq(trips.status, 'completed'))
            .groupBy(trips.vehicleId)
    );

    const fuelAgg = byVehicle(
        await db
            .select({
                vehicleId: fuelLogs.vehicleId,
                liters: sql`coalesce(sum(${fuelLogs.liters}), 0)`,
                cost: sql`coalesce(sum(${fuelLogs.cost}), 0)`,
            })
            .from(fuelLogs)
            .groupBy(fuelLogs.vehicleId)
    );

    const maintenanceAgg = byVehicle(
        await db
            .select({
                vehicleId: maintenanceLogs.vehicleId,
                cost: sql`coalesce(sum(${maintenanceLogs.cost}), 0)`,
            })
            .from(maintenanceLogs)
            .groupBy(maintenanceLogs.vehicleId)
    );

    const expenseAgg = byVehicle(
        await db
            .select({
                vehicleId: expenses.vehicleId,
                amount: sql`coalesce(sum(${expenses.amount}), 0)`,
            })
            .from(expenses)
            .groupBy(expenses.vehicleId)
    );

    const rows = fleet.map((vehicle) => {
        const trip = tripAgg.get(vehicle.id);
        const fuel = fuelAgg.get(vehicle.id);
        const maintenance = maintenanceAgg.get(vehicle.id);
        const expense = expenseAgg.get(vehicle.id);

        const distance = num(trip?.distance);
        const revenue = num(trip?.revenue);
        const liters = num(fuel?.liters);
        const fuelCost = num(fuel?.cost);
        const maintenanceCost = num(maintenance?.cost);
        const otherExpenses = num(expense?.amount);
        const acquisitionCost = num(vehicle.acquisitionCost);

        // The spec defines operational cost as Fuel + Maintenance. Tolls and other
        // expenses are reported separately so the two figures stay comparable.
        const operationalCost = fuelCost + maintenanceCost;

        // Both of these divide by data that may not exist yet. A vehicle that has
        // never burned fuel has no efficiency, and one with no acquisition cost has
        // no ROI — reporting null is honest; reporting 0 or Infinity is not.
        const fuelEfficiency = liters > 0 ? distance / liters : null;
        const roi =
            acquisitionCost > 0 ? (revenue - operationalCost) / acquisitionCost : null;

        return {
            vehicleId: vehicle.id,
            registrationNumber: vehicle.registrationNumber,
            name: vehicle.name,
            type: vehicle.type,
            region: vehicle.region,
            status: vehicle.status,
            completedTrips: Number(trip?.completedTrips ?? 0),
            distance: round(distance),
            fuelLiters: round(liters),
            fuelCost: round(fuelCost),
            maintenanceCost: round(maintenanceCost),
            otherExpenses: round(otherExpenses),
            operationalCost: round(operationalCost),
            totalCost: round(operationalCost + otherExpenses),
            revenue: round(revenue),
            acquisitionCost: round(acquisitionCost),
            fuelEfficiency: fuelEfficiency === null ? null : round(fuelEfficiency),
            roi: roi === null ? null : Number(roi.toFixed(4)),
        };
    });

    const totals = rows.reduce(
        (sum, row) => ({
            distance: sum.distance + row.distance,
            fuelLiters: sum.fuelLiters + row.fuelLiters,
            fuelCost: sum.fuelCost + row.fuelCost,
            maintenanceCost: sum.maintenanceCost + row.maintenanceCost,
            otherExpenses: sum.otherExpenses + row.otherExpenses,
            operationalCost: sum.operationalCost + row.operationalCost,
            revenue: sum.revenue + row.revenue,
            acquisitionCost: sum.acquisitionCost + row.acquisitionCost,
            completedTrips: sum.completedTrips + row.completedTrips,
        }),
        {
            distance: 0, fuelLiters: 0, fuelCost: 0, maintenanceCost: 0,
            otherExpenses: 0, operationalCost: 0, revenue: 0,
            acquisitionCost: 0, completedTrips: 0,
        }
    );

    const operationalFleet = fleet.filter((vehicle) => vehicle.status !== 'retired');
    const onTrip = fleet.filter((vehicle) => vehicle.status === 'on_trip').length;

    const summary = {
        vehicles: fleet.length,
        completedTrips: totals.completedTrips,
        distance: round(totals.distance),
        fuelLiters: round(totals.fuelLiters),
        fuelCost: round(totals.fuelCost),
        maintenanceCost: round(totals.maintenanceCost),
        otherExpenses: round(totals.otherExpenses),
        operationalCost: round(totals.operationalCost),
        revenue: round(totals.revenue),
        fuelEfficiency:
            totals.fuelLiters > 0 ? round(totals.distance / totals.fuelLiters) : null,
        fleetUtilization:
            operationalFleet.length > 0
                ? round((onTrip / operationalFleet.length) * 100)
                : 0,
        roi:
            totals.acquisitionCost > 0
                ? Number(
                      ((totals.revenue - totals.operationalCost) / totals.acquisitionCost).toFixed(4)
                  )
                : null,
    };

    return { rows, summary };
};

const CSV_COLUMNS = [
    ['registrationNumber', 'Registration Number'],
    ['name', 'Vehicle'],
    ['type', 'Type'],
    ['region', 'Region'],
    ['status', 'Status'],
    ['completedTrips', 'Completed Trips'],
    ['distance', 'Distance (km)'],
    ['fuelLiters', 'Fuel (L)'],
    ['fuelEfficiency', 'Fuel Efficiency (km/L)'],
    ['fuelCost', 'Fuel Cost'],
    ['maintenanceCost', 'Maintenance Cost'],
    ['otherExpenses', 'Other Expenses'],
    ['operationalCost', 'Operational Cost (Fuel + Maintenance)'],
    ['revenue', 'Revenue'],
    ['acquisitionCost', 'Acquisition Cost'],
    ['roi', 'ROI'],
];

// Quote anything containing a comma, quote, or newline; double up inner quotes.
// A vehicle named 'Van "Big", Mk2' must not shatter the column layout.
const csvCell = (value) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (rows) => {
    const header = CSV_COLUMNS.map(([, label]) => csvCell(label)).join(',');
    const body = rows.map((row) =>
        CSV_COLUMNS.map(([key]) => csvCell(row[key])).join(',')
    );
    return [header, ...body].join('\n');
};

export const getVehicleReport = async (req, res) => {
    try {
        const { type, region, format } = req.query;

        const { rows, summary } = await buildReport({ type, region });

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="transitops-vehicle-report.csv"'
            );
            return res.send(toCsv(rows));
        }

        res.json({ vehicles: rows, count: rows.length, summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSummaryReport = async (req, res) => {
    try {
        const { type, region } = req.query;
        const { summary } = await buildReport({ type, region });
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
