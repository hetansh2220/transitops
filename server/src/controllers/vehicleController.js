import db from '../config/db.js';
import { vehicles, maintenanceLogs } from '../db/schema.js';
import { eq, and, ilike } from 'drizzle-orm';

const VEHICLE_STATUSES = ['available', 'on_trip', 'in_shop', 'retired'];




const MANUAL_STATUSES = ['available', 'retired'];

const isPositiveNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) > 0;

const isNonNegativeNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) >= 0;

const isDuplicateKeyError = (error) =>
    error.code === '23505' || /duplicate key/i.test(error.message || '');



const MAX_LENGTHS = {
    registrationNumber: 20,
    name: 100,
    model: 100,
    type: 50,
    region: 50,
};


const parseId = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const validateLengths = (fields) => {
    for (const [field, limit] of Object.entries(MAX_LENGTHS)) {
        const value = fields[field];
        if (typeof value === 'string' && value.trim().length > limit) {
            return `${field} must be ${limit} characters or fewer`;
        }
    }
    return null;
};

export const createVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            name,
            model,
            type,
            region,
            maxLoadCapacity,
            odometer,
            acquisitionCost,
        } = req.body;

        if (!registrationNumber || !name || !type) {
            return res
                .status(400)
                .json({ error: 'Registration number, name and type are required' });
        }

        const lengthError = validateLengths({ registrationNumber, name, model, type, region });
        if (lengthError) {
            return res.status(400).json({ error: lengthError });
        }

        if (!isPositiveNumber(maxLoadCapacity)) {
            return res
                .status(400)
                .json({ error: 'Max load capacity must be a number greater than 0' });
        }

        if (odometer !== undefined && !isNonNegativeNumber(odometer)) {
            return res.status(400).json({ error: 'Odometer must be a number of 0 or more' });
        }

        if (acquisitionCost !== undefined && !isNonNegativeNumber(acquisitionCost)) {
            return res
                .status(400)
                .json({ error: 'Acquisition cost must be a number of 0 or more' });
        }

        const registration = registrationNumber.trim().toUpperCase();

        const existing = await db
            .select()
            .from(vehicles)
            .where(eq(vehicles.registrationNumber, registration));
        if (existing.length > 0) {
            return res
                .status(409)
                .json({ error: 'A vehicle with this registration number already exists' });
        }

        const [vehicle] = await db
            .insert(vehicles)
            .values({
                registrationNumber: registration,
                name,
                model,
                type,
                region,
                maxLoadCapacity: String(maxLoadCapacity),
                odometer: odometer !== undefined ? String(odometer) : undefined,
                acquisitionCost:
                    acquisitionCost !== undefined ? String(acquisitionCost) : undefined,
            })
            .returning();

        res.status(201).json({ vehicle });
    } catch (error) {


        if (isDuplicateKeyError(error)) {
            return res
                .status(409)
                .json({ error: 'A vehicle with this registration number already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const listVehicles = async (req, res) => {
    try {
        const { status, type, region, search } = req.query;

        if (status && !VEHICLE_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${VEHICLE_STATUSES.join(', ')}`,
            });
        }

        const filters = [];
        if (status) filters.push(eq(vehicles.status, status));
        if (type) filters.push(eq(vehicles.type, type));
        if (region) filters.push(eq(vehicles.region, region));
        if (search) filters.push(ilike(vehicles.registrationNumber, `%${search}%`));

        const rows = filters.length
            ? await db
                .select()
                .from(vehicles)
                .where(filters.length === 1 ? filters[0] : and(...filters))
            : await db.select().from(vehicles);

        res.json({ vehicles: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVehicle = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ error: 'Invalid vehicle id' });
        }

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json({ vehicle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ error: 'Invalid vehicle id' });
        }

        const {
            registrationNumber,
            name,
            model,
            type,
            region,
            maxLoadCapacity,
            odometer,
            acquisitionCost,
        } = req.body;

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const lengthError = validateLengths({ registrationNumber, name, model, type, region });
        if (lengthError) {
            return res.status(400).json({ error: lengthError });
        }

        const updates = {};

        if (registrationNumber !== undefined) {
            const registration = registrationNumber.trim().toUpperCase();
            if (registration !== vehicle.registrationNumber) {
                const existing = await db
                    .select()
                    .from(vehicles)
                    .where(eq(vehicles.registrationNumber, registration));
                if (existing.length > 0) {
                    return res.status(409).json({
                        error: 'A vehicle with this registration number already exists',
                    });
                }
            }
            updates.registrationNumber = registration;
        }

        if (name !== undefined) updates.name = name;
        if (model !== undefined) updates.model = model;
        if (type !== undefined) updates.type = type;
        if (region !== undefined) updates.region = region;

        if (maxLoadCapacity !== undefined) {
            if (!isPositiveNumber(maxLoadCapacity)) {
                return res
                    .status(400)
                    .json({ error: 'Max load capacity must be a number greater than 0' });
            }
            updates.maxLoadCapacity = String(maxLoadCapacity);
        }

        if (odometer !== undefined) {
            if (!isNonNegativeNumber(odometer)) {
                return res.status(400).json({ error: 'Odometer must be a number of 0 or more' });
            }
            if (Number(odometer) < Number(vehicle.odometer)) {
                return res.status(400).json({ error: 'Odometer cannot be rolled back' });
            }
            updates.odometer = String(odometer);
        }

        if (acquisitionCost !== undefined) {
            if (!isNonNegativeNumber(acquisitionCost)) {
                return res
                    .status(400)
                    .json({ error: 'Acquisition cost must be a number of 0 or more' });
            }
            updates.acquisitionCost = String(acquisitionCost);
        }

        if (req.body.status !== undefined) {
            return res.status(400).json({
                error: 'Status cannot be changed here. Use PUT /api/vehicles/:id/status',
            });
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const [updated] = await db
            .update(vehicles)
            .set(updates)
            .where(eq(vehicles.id, id))
            .returning();

        res.json({ vehicle: updated });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res
                .status(409)
                .json({ error: 'A vehicle with this registration number already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const updateVehicleStatus = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ error: 'Invalid vehicle id' });
        }

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        if (!MANUAL_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Status must be one of: ${MANUAL_STATUSES.join(', ')}. 'on_trip' is set by dispatching a trip and 'in_shop' by opening a maintenance record.`,
            });
        }

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        if (vehicle.status === status) {
            return res.json({ vehicle });
        }



        if (vehicle.status === 'on_trip') {
            return res.status(409).json({
                error: 'Vehicle is on a trip. Complete or cancel the trip to change its status.',
            });
        }



        if (vehicle.status === 'in_shop') {
            const openLogs = await db
                .select()
                .from(maintenanceLogs)
                .where(
                    and(
                        eq(maintenanceLogs.vehicleId, id),
                        eq(maintenanceLogs.status, 'open')
                    )
                );
            if (openLogs.length > 0) {
                return res.status(409).json({
                    error: 'Vehicle has an open maintenance record. Close it to change status.',
                });
            }
        }

        const [updated] = await db
            .update(vehicles)
            .set({ status })
            .where(eq(vehicles.id, id))
            .returning();

        res.json({ vehicle: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
