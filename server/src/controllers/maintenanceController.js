import db from '../config/db.js';
import { maintenanceLogs } from '../db/schema.js';
import { eq, and, ne } from 'drizzle-orm';

export const getMaintenanceLogs = async (req, res) => {
    try {
        const logs = await db.select().from(maintenanceLogs);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMaintenanceLogById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
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

        if (!vehicleId || !serviceType || !date) {
            return res.status(400).json({ error: 'Vehicle ID, service type, and date are required' });
        }

        const logStatus = status || 'open';

        if (logStatus === 'open') {
            const existingOpen = await db.select().from(maintenanceLogs).where(
                and(
                    eq(maintenanceLogs.vehicleId, vehicleId),
                    eq(maintenanceLogs.status, 'open')
                )
            );
            if (existingOpen.length > 0) {
                return res.status(400).json({ error: 'A maintenance log is already open for this vehicle' });
            }
        }

        const [newLog] = await db.insert(maintenanceLogs).values({
            vehicleId,
            serviceType,
            cost: cost || '0.00',
            date,
            status: logStatus,
            closedAt: logStatus === 'closed' ? new Date() : null,
        }).returning();

        res.status(201).json(newLog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMaintenanceLog = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { vehicleId, serviceType, cost, date, status } = req.body;

        const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));
        if (!log) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        const targetVehicleId = vehicleId !== undefined ? vehicleId : log.vehicleId;
        const targetStatus = status !== undefined ? status : log.status;

        if (targetStatus === 'open') {
            const existingOpen = await db.select().from(maintenanceLogs).where(
                and(
                    eq(maintenanceLogs.vehicleId, targetVehicleId),
                    eq(maintenanceLogs.status, 'open'),
                    ne(maintenanceLogs.id, id)
                )
            );
            if (existingOpen.length > 0) {
                return res.status(400).json({ error: 'A maintenance log is already open for this vehicle' });
            }
        }

        let closedAtVal = log.closedAt;
        if (status === 'closed' && log.status !== 'closed') {
            closedAtVal = new Date();
        } else if (status === 'open') {
            closedAtVal = null;
        }

        const [updatedLog] = await db.update(maintenanceLogs).set({
            vehicleId: targetVehicleId,
            serviceType: serviceType !== undefined ? serviceType : log.serviceType,
            cost: cost !== undefined ? cost : log.cost,
            date: date !== undefined ? date : log.date,
            status: targetStatus,
            closedAt: closedAtVal,
        }).where(eq(maintenanceLogs.id, id)).returning();

        res.json(updatedLog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMaintenanceLog = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const [log] = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.id, id));
        if (!log) {
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, id));
        res.json({ message: 'Maintenance log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
