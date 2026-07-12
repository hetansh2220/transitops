import db from '../config/db.js';
import { fuelLogs, vehicles, trips } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const parseId = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const isPositiveNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) > 0;

const isNonNegativeNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) >= 0;

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));

const today = () => new Date().toISOString().slice(0, 10);

export const createFuelLog = async (req, res) => {
    try {
        const { vehicleId, tripId, liters, cost, date } = req.body;

        const vId = parseId(vehicleId);
        if (!vId) {
            return res.status(400).json({ error: 'A valid vehicleId is required' });
        }

        if (!isPositiveNumber(liters)) {
            return res.status(400).json({ error: 'Liters must be a number greater than 0' });
        }

        if (!isNonNegativeNumber(cost)) {
            return res.status(400).json({ error: 'Cost must be a number of 0 or more' });
        }

        const logDate = date ?? today();
        if (!isValidDate(logDate)) {
            return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
        }

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vId));
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        let tId = null;
        if (tripId !== undefined && tripId !== null) {
            tId = parseId(tripId);
            if (!tId) return res.status(400).json({ error: 'Invalid tripId' });

            const [trip] = await db.select().from(trips).where(eq(trips.id, tId));
            if (!trip) return res.status(404).json({ error: 'Trip not found' });



            if (trip.vehicleId !== vId) {
                return res
                    .status(400)
                    .json({ error: "Trip belongs to a different vehicle than the one given" });
            }
        }

        const [fuelLog] = await db
            .insert(fuelLogs)
            .values({
                vehicleId: vId,
                tripId: tId,
                liters: String(liters),
                cost: String(cost),
                date: logDate,
            })
            .returning();

        res.status(201).json({ fuelLog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listFuelLogs = async (req, res) => {
    try {
        const { vehicleId, tripId } = req.query;

        const filters = [];

        if (vehicleId !== undefined) {
            const vId = parseId(vehicleId);
            if (!vId) return res.status(400).json({ error: 'Invalid vehicleId' });
            filters.push(eq(fuelLogs.vehicleId, vId));
        }

        if (tripId !== undefined) {
            const tId = parseId(tripId);
            if (!tId) return res.status(400).json({ error: 'Invalid tripId' });
            filters.push(eq(fuelLogs.tripId, tId));
        }

        const base = db
            .select({
                id: fuelLogs.id,
                vehicleId: fuelLogs.vehicleId,
                vehicleName: vehicles.name,
                vehicleRegistration: vehicles.registrationNumber,
                tripId: fuelLogs.tripId,
                liters: fuelLogs.liters,
                cost: fuelLogs.cost,
                date: fuelLogs.date,
                createdAt: fuelLogs.createdAt,
            })
            .from(fuelLogs)
            .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id));

        const rows = filters.length
            ? await base
                .where(filters.length === 1 ? filters[0] : and(...filters))
                .orderBy(sql`${fuelLogs.date} desc`)
            : await base.orderBy(sql`${fuelLogs.date} desc`);

        const totalLiters = rows.reduce((sum, row) => sum + Number(row.liters), 0);
        const totalCost = rows.reduce((sum, row) => sum + Number(row.cost), 0);

        res.json({
            fuelLogs: rows,
            count: rows.length,
            totalLiters: Number(totalLiters.toFixed(2)),
            totalCost: Number(totalCost.toFixed(2)),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
