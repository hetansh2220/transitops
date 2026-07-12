import db from '../config/db.js';
import { drivers, trips } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export const getDrivers = async (req, res) => {
    try {
        const allDrivers = await db.select().from(drivers);
        res.json(allDrivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDriverById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createDriver = async (req, res) => {
    try {
        const { userId, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

        if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate) {
            return res.status(400).json({ error: 'Name, license number, category, and expiry date are required' });
        }

        const existingDriver = await db.select().from(drivers).where(eq(drivers.licenseNumber, licenseNumber));
        if (existingDriver.length > 0) {
            return res.status(400).json({ error: 'License number already registered' });
        }

        const [newDriver] = await db.insert(drivers).values({
            userId: userId || null,
            name,
            licenseNumber,
            licenseCategory,
            licenseExpiryDate,
            contactNumber: contactNumber || null,
            safetyScore: safetyScore || '100.00',
            status: status || 'available',
        }).returning();

        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { userId, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

        const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        if (licenseNumber && licenseNumber !== driver.licenseNumber) {
            const existingDriver = await db.select().from(drivers).where(eq(drivers.licenseNumber, licenseNumber));
            if (existingDriver.length > 0) {
                return res.status(400).json({ error: 'License number already registered' });
            }
        }

        if (status !== undefined && status !== driver.status) {
            // 'on_trip' belongs to the trip state machine. Letting it be set or
            // cleared by hand would let a driver who is mid-trip be assigned to a
            // second trip.
            if (status === 'on_trip') {
                return res.status(400).json({
                    error: "Status 'on_trip' is set by dispatching a trip, not by editing the driver",
                });
            }

            if (driver.status === 'on_trip') {
                return res.status(409).json({
                    error: 'Driver is on a trip. Complete or cancel the trip to change their status.',
                });
            }
        }

        const [updatedDriver] = await db.update(drivers).set({
            userId: userId !== undefined ? userId : driver.userId,
            name: name !== undefined ? name : driver.name,
            licenseNumber: licenseNumber !== undefined ? licenseNumber : driver.licenseNumber,
            licenseCategory: licenseCategory !== undefined ? licenseCategory : driver.licenseCategory,
            licenseExpiryDate: licenseExpiryDate !== undefined ? licenseExpiryDate : driver.licenseExpiryDate,
            contactNumber: contactNumber !== undefined ? contactNumber : driver.contactNumber,
            safetyScore: safetyScore !== undefined ? safetyScore : driver.safetyScore,
            status: status !== undefined ? status : driver.status,
        }).where(eq(drivers.id, id)).returning();

        res.json(updatedDriver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid driver id' });
        }

        const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        if (driver.status === 'on_trip') {
            return res.status(409).json({
                error: 'Driver is on a trip. Complete or cancel the trip before removing them.',
            });
        }

        // Trips reference the driver, so deleting one with history would either
        // fail on the foreign key or destroy the trip record behind it. Suspending
        // keeps the history intact, which is what the reports rely on.
        const [{ tripCount }] = await db
            .select({ tripCount: sql`count(*)::int` })
            .from(trips)
            .where(eq(trips.driverId, id));

        if (Number(tripCount) > 0) {
            return res.status(409).json({
                error: `Driver has ${tripCount} trip(s) on record and cannot be deleted. Set their status to 'suspended' or 'off_duty' instead.`,
            });
        }

        await db.delete(drivers).where(eq(drivers.id, id));
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
