import db from '../config/db.js';
import { maintenanceLogs, vehicles } from '../db/schema.js';
import { eq, and, ne, sql } from 'drizzle-orm';

const parseId = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const isNonNegativeNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) >= 0;

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));

// Opening a record sends the vehicle to the shop; closing releases it. A retired
// vehicle stays retired either way — retirement outranks maintenance.
const sendToShop = async (tx, vehicle) => {
    if (vehicle.status === 'retired') return vehicle;
    const [updated] = await tx
        .update(vehicles)
        .set({ status: 'in_shop' })
        .where(eq(vehicles.id, vehicle.id))
        .returning();
    return updated;
};

const releaseFromShop = async (tx, vehicleId) => {
    // Only flips a vehicle that is actually in the shop, so a retired vehicle is
    // never silently un-retired.
    const [updated] = await tx
        .update(vehicles)
        .set({ status: 'available' })
        .where(and(eq(vehicles.id, vehicleId), eq(vehicles.status, 'in_shop')))
        .returning();
    return updated ?? null;
};

export const getMaintenanceLogs = async (req, res) => {
    try {
        const { vehicleId, status } = req.query;

        const filters = [];

        if (vehicleId !== undefined) {
            const vId = parseId(vehicleId);
            if (!vId) return res.status(400).json({ error: 'Invalid vehicleId' });
            filters.push(eq(maintenanceLogs.vehicleId, vId));
        }

        if (status !== undefined) {
            if (!['open', 'closed'].includes(status)) {
                return res.status(400).json({ error: 'Status must be open or closed' });
            }
            filters.push(eq(maintenanceLogs.status, status));
        }

        const base = db
            .select({
                id: maintenanceLogs.id,
                vehicleId: maintenanceLogs.vehicleId,
                vehicleName: vehicles.name,
                vehicleRegistration: vehicles.registrationNumber,
                serviceType: maintenanceLogs.serviceType,
                cost: maintenanceLogs.cost,
                date: maintenanceLogs.date,
                status: maintenanceLogs.status,
                createdAt: maintenanceLogs.createdAt,
                closedAt: maintenanceLogs.closedAt,
            })
            .from(maintenanceLogs)
            .leftJoin(vehicles, eq(maintenanceLogs.vehicleId, vehicles.id));

        const logs = filters.length
            ? await base
                  .where(filters.length === 1 ? filters[0] : and(...filters))
                  .orderBy(sql`${maintenanceLogs.date} desc`)
            : await base.orderBy(sql`${maintenanceLogs.date} desc`);

        const totalCost = logs.reduce((sum, log) => sum + Number(log.cost), 0);

        res.json({
            maintenanceLogs: logs,
            count: logs.length,
            totalCost: Number(totalCost.toFixed(2)),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMaintenanceLogById = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid maintenance log id' });

        const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));

        if (!log) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMaintenanceLog = async (req, res) => {
    try {
        const { vehicleId, serviceType, cost, date, status } = req.body;

        const vId = parseId(vehicleId);
        if (!vId || !serviceType || !date) {
            return res
                .status(400)
                .json({ error: 'A valid vehicleId, service type, and date are required' });
        }

        if (!isValidDate(date)) {
            return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
        }

        if (cost !== undefined && !isNonNegativeNumber(cost)) {
            return res.status(400).json({ error: 'Cost must be a number of 0 or more' });
        }

        const logStatus = status ?? 'open';
        if (!['open', 'closed'].includes(logStatus)) {
            return res.status(400).json({ error: 'Status must be open or closed' });
        }

        const result = await db.transaction(async (tx) => {
            const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, vId));
            if (!vehicle) {
                return { status: 404, body: { error: 'Vehicle not found' } };
            }

            if (logStatus === 'open') {
                // A vehicle mid-trip cannot be in the shop at the same time.
                if (vehicle.status === 'on_trip') {
                    return {
                        status: 409,
                        body: {
                            error: 'Vehicle is on a trip. Complete or cancel the trip before opening maintenance.',
                        },
                    };
                }

                const existingOpen = await tx
                    .select()
                    .from(maintenanceLogs)
                    .where(
                        and(
                            eq(maintenanceLogs.vehicleId, vId),
                            eq(maintenanceLogs.status, 'open')
                        )
                    );
                if (existingOpen.length > 0) {
                    return {
                        status: 409,
                        body: { error: 'A maintenance log is already open for this vehicle' },
                    };
                }
            }

            const [newLog] = await tx
                .insert(maintenanceLogs)
                .values({
                    vehicleId: vId,
                    serviceType,
                    cost: cost !== undefined ? String(cost) : '0',
                    date,
                    status: logStatus,
                    closedAt: logStatus === 'closed' ? new Date() : null,
                })
                .returning();

            // The mandatory rule: an active maintenance record puts the vehicle in
            // the shop, which removes it from the dispatch pool.
            const updatedVehicle =
                logStatus === 'open' ? await sendToShop(tx, vehicle) : vehicle;

            return {
                status: 201,
                body: { maintenanceLog: newLog, vehicle: updatedVehicle },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMaintenanceLog = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid maintenance log id' });

        const { vehicleId, serviceType, cost, date, status } = req.body;

        if (date !== undefined && !isValidDate(date)) {
            return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
        }

        if (cost !== undefined && !isNonNegativeNumber(cost)) {
            return res.status(400).json({ error: 'Cost must be a number of 0 or more' });
        }

        if (status !== undefined && !['open', 'closed'].includes(status)) {
            return res.status(400).json({ error: 'Status must be open or closed' });
        }

        const result = await db.transaction(async (tx) => {
            const [log] = await tx.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));
            if (!log) {
                return { status: 404, body: { error: 'Maintenance log not found' } };
            }

            // Moving an open record to another vehicle would strand the current one
            // in the shop with nothing left to close.
            if (
                vehicleId !== undefined &&
                parseId(vehicleId) !== log.vehicleId &&
                log.status === 'open'
            ) {
                return {
                    status: 409,
                    body: { error: 'Close this maintenance log before moving it to another vehicle' },
                };
            }

            const targetVehicleId =
                vehicleId !== undefined ? parseId(vehicleId) : log.vehicleId;
            if (!targetVehicleId) {
                return { status: 400, body: { error: 'Invalid vehicleId' } };
            }

            const targetStatus = status ?? log.status;

            const [vehicle] = await tx
                .select()
                .from(vehicles)
                .where(eq(vehicles.id, targetVehicleId));
            if (!vehicle) {
                return { status: 404, body: { error: 'Vehicle not found' } };
            }

            // Re-opening a closed record: same guards as opening a fresh one.
            if (targetStatus === 'open' && log.status !== 'open') {
                if (vehicle.status === 'on_trip') {
                    return {
                        status: 409,
                        body: {
                            error: 'Vehicle is on a trip. Complete or cancel the trip before re-opening maintenance.',
                        },
                    };
                }

                const existingOpen = await tx
                    .select()
                    .from(maintenanceLogs)
                    .where(
                        and(
                            eq(maintenanceLogs.vehicleId, targetVehicleId),
                            eq(maintenanceLogs.status, 'open'),
                            ne(maintenanceLogs.id, id)
                        )
                    );
                if (existingOpen.length > 0) {
                    return {
                        status: 409,
                        body: { error: 'A maintenance log is already open for this vehicle' },
                    };
                }
            }

            let closedAtVal = log.closedAt;
            if (targetStatus === 'closed' && log.status !== 'closed') {
                closedAtVal = new Date();
            } else if (targetStatus === 'open') {
                closedAtVal = null;
            }

            const [updatedLog] = await tx
                .update(maintenanceLogs)
                .set({
                    vehicleId: targetVehicleId,
                    serviceType: serviceType !== undefined ? serviceType : log.serviceType,
                    cost: cost !== undefined ? String(cost) : log.cost,
                    date: date !== undefined ? date : log.date,
                    status: targetStatus,
                    closedAt: closedAtVal,
                })
                .where(eq(maintenanceLogs.id, id))
                .returning();

            let updatedVehicle = vehicle;

            if (log.status === 'open' && targetStatus === 'closed') {
                // Closing restores the vehicle — unless it was retired meanwhile.
                updatedVehicle = (await releaseFromShop(tx, targetVehicleId)) ?? vehicle;
            } else if (log.status === 'closed' && targetStatus === 'open') {
                updatedVehicle = await sendToShop(tx, vehicle);
            }

            return {
                status: 200,
                body: { maintenanceLog: updatedLog, vehicle: updatedVehicle },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMaintenanceLog = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid maintenance log id' });

        const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));
        if (!log) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        // Deleting an open record would leave the vehicle stuck in the shop with no
        // record left to close it.
        if (log.status === 'open') {
            return res.status(409).json({
                error: 'Close this maintenance log before deleting it, or the vehicle stays in the shop',
            });
        }

        await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, id));
        res.json({ message: 'Maintenance log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
