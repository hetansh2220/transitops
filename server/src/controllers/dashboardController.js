import db from '../config/db.js';
import { vehicles, drivers, trips, maintenanceLogs } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const VEHICLE_STATUSES = ['available', 'on_trip', 'in_shop', 'retired'];

const countBy = (rows, status) => rows.filter((row) => row.status === status).length;

export const getDashboard = async (req, res) => {
    try {
        const { type, status, region } = req.query;

        if (status && !VEHICLE_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${VEHICLE_STATUSES.join(', ')}`,
            });
        }

        // The filters apply to the fleet. Trip and driver KPIs are then scoped to
        // the vehicles that survive the filter, so the whole dashboard stays
        // consistent with whatever the user selected.
        const vehicleFilters = [];
        if (type) vehicleFilters.push(eq(vehicles.type, type));
        if (region) vehicleFilters.push(eq(vehicles.region, region));
        if (status) vehicleFilters.push(eq(vehicles.status, status));

        const fleet = vehicleFilters.length
            ? await db
                  .select()
                  .from(vehicles)
                  .where(
                      vehicleFilters.length === 1 ? vehicleFilters[0] : and(...vehicleFilters)
                  )
            : await db.select().from(vehicles);

        const fleetIds = fleet.map((vehicle) => vehicle.id);

        const allTrips = fleetIds.length
            ? await db
                  .select({ id: trips.id, status: trips.status, driverId: trips.driverId })
                  .from(trips)
                  .where(sql`${trips.vehicleId} in ${fleetIds}`)
            : [];

        const allDrivers = await db.select().from(drivers);

        const openMaintenance = fleetIds.length
            ? await db
                  .select({ id: maintenanceLogs.id })
                  .from(maintenanceLogs)
                  .where(
                      and(
                          eq(maintenanceLogs.status, 'open'),
                          sql`${maintenanceLogs.vehicleId} in ${fleetIds}`
                      )
                  )
            : [];

        const onTrip = countBy(fleet, 'on_trip');
        const available = countBy(fleet, 'available');
        const inShop = countBy(fleet, 'in_shop');
        const retired = countBy(fleet, 'retired');

        // A retired vehicle is not part of the operating fleet, so it cannot be
        // utilised — excluding it keeps the percentage honest.
        const operational = fleet.length - retired;
        const fleetUtilization = operational > 0 ? (onTrip / operational) * 100 : 0;

        // Drivers on duty are those actually on one of the filtered trips.
        const driversOnFilteredTrips = new Set(
            allTrips.filter((trip) => trip.status === 'dispatched').map((trip) => trip.driverId)
        );

        res.json({
            vehicles: {
                total: fleet.length,
                active: onTrip,
                available,
                inMaintenance: inShop,
                retired,
            },
            trips: {
                active: allTrips.filter((trip) => trip.status === 'dispatched').length,
                pending: allTrips.filter((trip) => trip.status === 'draft').length,
                completed: allTrips.filter((trip) => trip.status === 'completed').length,
                cancelled: allTrips.filter((trip) => trip.status === 'cancelled').length,
            },
            drivers: {
                total: allDrivers.length,
                onDuty: driversOnFilteredTrips.size,
                available: countBy(allDrivers, 'available'),
                offDuty: countBy(allDrivers, 'off_duty'),
                suspended: countBy(allDrivers, 'suspended'),
            },
            maintenance: {
                openRecords: openMaintenance.length,
            },
            fleetUtilization: Number(fleetUtilization.toFixed(2)),
            filters: { type: type ?? null, status: status ?? null, region: region ?? null },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
