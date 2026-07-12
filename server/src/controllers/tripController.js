import db from '../config/db.js';
import { trips, vehicles, drivers, fuelLogs } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const TRIP_STATUSES = ['draft', 'dispatched', 'completed', 'cancelled'];

const parseId = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const isPositiveNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) > 0;

const isNonNegativeNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) >= 0;

const today = () => new Date().toISOString().slice(0, 10);



const isLicenseExpired = (driver) => driver.licenseExpiryDate < today();


const validateAssignment = (vehicle, driver, cargoWeight) => {
    if (!vehicle) return 'Vehicle not found';
    if (!driver) return 'Driver not found';

    if (vehicle.status === 'retired') return 'Vehicle is retired and cannot be dispatched';
    if (vehicle.status === 'in_shop') return 'Vehicle is in the shop and cannot be dispatched';
    if (vehicle.status === 'on_trip') return 'Vehicle is already on a trip';
    if (vehicle.status !== 'available') return `Vehicle is not available (status: ${vehicle.status})`;

    if (driver.status === 'suspended') return 'Driver is suspended and cannot be assigned';
    if (driver.status === 'on_trip') return 'Driver is already on a trip';
    if (driver.status === 'off_duty') return 'Driver is off duty and cannot be assigned';
    if (driver.status !== 'available') return `Driver is not available (status: ${driver.status})`;

    if (isLicenseExpired(driver)) {
        return `Driver's licence expired on ${driver.licenseExpiryDate}`;
    }



    if (Number(cargoWeight) > Number(vehicle.maxLoadCapacity)) {
        return `Cargo weight (${Number(cargoWeight)} kg) exceeds the vehicle's maximum load capacity (${Number(
            vehicle.maxLoadCapacity
        )} kg)`;
    }

    return null;
};

export const createTrip = async (req, res) => {
    try {
        const {
            source,
            destination,
            vehicleId,
            driverId,
            cargoWeight,
            plannedDistance,
            revenue,
        } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ error: 'Source and destination are required' });
        }

        const vId = parseId(vehicleId);
        const dId = parseId(driverId);
        if (!vId || !dId) {
            return res.status(400).json({ error: 'A valid vehicleId and driverId are required' });
        }

        if (!isPositiveNumber(cargoWeight)) {
            return res
                .status(400)
                .json({ error: 'Cargo weight must be a number greater than 0' });
        }

        if (plannedDistance !== undefined && !isNonNegativeNumber(plannedDistance)) {
            return res
                .status(400)
                .json({ error: 'Planned distance must be a number of 0 or more' });
        }

        if (revenue !== undefined && !isNonNegativeNumber(revenue)) {
            return res.status(400).json({ error: 'Revenue must be a number of 0 or more' });
        }

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vId));
        const [driver] = await db.select().from(drivers).where(eq(drivers.id, dId));

        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        const violation = validateAssignment(vehicle, driver, cargoWeight);
        if (violation) {
            return res.status(409).json({ error: violation });
        }

        const [trip] = await db
            .insert(trips)
            .values({
                source,
                destination,
                vehicleId: vId,
                driverId: dId,
                cargoWeight: String(cargoWeight),
                plannedDistance:
                    plannedDistance !== undefined ? String(plannedDistance) : undefined,
                revenue: revenue !== undefined ? String(revenue) : undefined,
                createdBy: req.user?.id ?? null,
                status: 'draft',
            })
            .returning();

        res.status(201).json({ trip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const dispatchTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });

        const result = await db.transaction(async (tx) => {
            const [trip] = await tx.select().from(trips).where(eq(trips.id, id));
            if (!trip) return { status: 404, body: { error: 'Trip not found' } };

            if (trip.status !== 'draft') {
                return {
                    status: 409,
                    body: { error: `Only draft trips can be dispatched (trip is ${trip.status})` },
                };
            }

            const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId));
            const [driver] = await tx.select().from(drivers).where(eq(drivers.id, trip.driverId));


            const violation = validateAssignment(vehicle, driver, trip.cargoWeight);
            if (violation) return { status: 409, body: { error: violation } };




            const claimedVehicle = await tx
                .update(vehicles)
                .set({ status: 'on_trip' })
                .where(and(eq(vehicles.id, vehicle.id), eq(vehicles.status, 'available')))
                .returning();
            if (claimedVehicle.length === 0) {
                return { status: 409, body: { error: 'Vehicle was just taken by another trip' } };
            }

            const claimedDriver = await tx
                .update(drivers)
                .set({ status: 'on_trip' })
                .where(and(eq(drivers.id, driver.id), eq(drivers.status, 'available')))
                .returning();
            if (claimedDriver.length === 0) {
                return { status: 409, body: { error: 'Driver was just taken by another trip' } };
            }

            const claimedTrip = await tx
                .update(trips)
                .set({
                    status: 'dispatched',
                    dispatchedAt: new Date(),
                    startOdometer: vehicle.odometer,
                })
                .where(and(eq(trips.id, id), eq(trips.status, 'draft')))
                .returning();
            if (claimedTrip.length === 0) {
                return { status: 409, body: { error: 'Trip was just dispatched by someone else' } };
            }

            return {
                status: 200,
                body: {
                    trip: claimedTrip[0],
                    vehicle: claimedVehicle[0],
                    driver: claimedDriver[0],
                },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const completeTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });

        const { endOdometer, fuelConsumed, fuelCost, date } = req.body;

        if (!isNonNegativeNumber(endOdometer)) {
            return res
                .status(400)
                .json({ error: 'Final odometer reading is required and must be a number' });
        }

        if (fuelConsumed !== undefined && !isNonNegativeNumber(fuelConsumed)) {
            return res.status(400).json({ error: 'Fuel consumed must be a number of 0 or more' });
        }

        if (fuelCost !== undefined && !isNonNegativeNumber(fuelCost)) {
            return res.status(400).json({ error: 'Fuel cost must be a number of 0 or more' });
        }

        const result = await db.transaction(async (tx) => {
            const [trip] = await tx.select().from(trips).where(eq(trips.id, id));
            if (!trip) return { status: 404, body: { error: 'Trip not found' } };

            if (trip.status !== 'dispatched') {
                return {
                    status: 409,
                    body: {
                        error: `Only dispatched trips can be completed (trip is ${trip.status})`,
                    },
                };
            }

            const start = Number(trip.startOdometer ?? 0);
            const end = Number(endOdometer);
            if (end < start) {
                return {
                    status: 400,
                    body: {
                        error: `Final odometer (${end}) cannot be less than the reading at dispatch (${start})`,
                    },
                };
            }

            const actualDistance = end - start;

            const [updatedTrip] = await tx
                .update(trips)
                .set({
                    status: 'completed',
                    completedAt: new Date(),
                    endOdometer: String(end),
                    actualDistance: String(actualDistance),
                })
                .where(and(eq(trips.id, id), eq(trips.status, 'dispatched')))
                .returning();
            if (!updatedTrip) {
                return { status: 409, body: { error: 'Trip was just updated by someone else' } };
            }


            const [updatedVehicle] = await tx
                .update(vehicles)
                .set({ status: 'available', odometer: String(end) })
                .where(eq(vehicles.id, trip.vehicleId))
                .returning();

            const [updatedDriver] = await tx
                .update(drivers)
                .set({ status: 'available' })
                .where(eq(drivers.id, trip.driverId))
                .returning();



            let fuelLog = null;
            if (fuelConsumed !== undefined && Number(fuelConsumed) > 0) {
                [fuelLog] = await tx
                    .insert(fuelLogs)
                    .values({
                        vehicleId: trip.vehicleId,
                        tripId: trip.id,
                        liters: String(fuelConsumed),
                        cost: String(fuelCost ?? 0),
                        date: date ?? today(),
                    })
                    .returning();
            }

            return {
                status: 200,
                body: {
                    trip: updatedTrip,
                    vehicle: updatedVehicle,
                    driver: updatedDriver,
                    fuelLog,
                },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });

        const result = await db.transaction(async (tx) => {
            const [trip] = await tx.select().from(trips).where(eq(trips.id, id));
            if (!trip) return { status: 404, body: { error: 'Trip not found' } };

            if (trip.status === 'completed') {
                return { status: 409, body: { error: 'A completed trip cannot be cancelled' } };
            }
            if (trip.status === 'cancelled') {
                return { status: 409, body: { error: 'Trip is already cancelled' } };
            }

            const wasDispatched = trip.status === 'dispatched';

            const [updatedTrip] = await tx
                .update(trips)
                .set({ status: 'cancelled' })
                .where(and(eq(trips.id, id), eq(trips.status, trip.status)))
                .returning();
            if (!updatedTrip) {
                return { status: 409, body: { error: 'Trip was just updated by someone else' } };
            }



            let updatedVehicle = null;
            let updatedDriver = null;

            if (wasDispatched) {


                [updatedVehicle] = await tx
                    .update(vehicles)
                    .set({ status: 'available' })
                    .where(and(eq(vehicles.id, trip.vehicleId), eq(vehicles.status, 'on_trip')))
                    .returning();

                [updatedDriver] = await tx
                    .update(drivers)
                    .set({ status: 'available' })
                    .where(and(eq(drivers.id, trip.driverId), eq(drivers.status, 'on_trip')))
                    .returning();
            }

            return {
                status: 200,
                body: {
                    trip: updatedTrip,
                    vehicle: updatedVehicle ?? null,
                    driver: updatedDriver ?? null,
                },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listTrips = async (req, res) => {
    try {
        const { status, vehicleId, driverId } = req.query;

        if (status && !TRIP_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${TRIP_STATUSES.join(', ')}`,
            });
        }

        const filters = [];
        if (status) filters.push(eq(trips.status, status));

        if (vehicleId !== undefined) {
            const vId = parseId(vehicleId);
            if (!vId) return res.status(400).json({ error: 'Invalid vehicleId' });
            filters.push(eq(trips.vehicleId, vId));
        }

        if (driverId !== undefined) {
            const dId = parseId(driverId);
            if (!dId) return res.status(400).json({ error: 'Invalid driverId' });
            filters.push(eq(trips.driverId, dId));
        }


        const base = db
            .select({
                id: trips.id,
                source: trips.source,
                destination: trips.destination,
                status: trips.status,
                cargoWeight: trips.cargoWeight,
                plannedDistance: trips.plannedDistance,
                actualDistance: trips.actualDistance,
                revenue: trips.revenue,
                startOdometer: trips.startOdometer,
                endOdometer: trips.endOdometer,
                createdAt: trips.createdAt,
                dispatchedAt: trips.dispatchedAt,
                completedAt: trips.completedAt,
                vehicleId: trips.vehicleId,
                vehicleName: vehicles.name,
                vehicleRegistration: vehicles.registrationNumber,
                driverId: trips.driverId,
                driverName: drivers.name,
            })
            .from(trips)
            .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
            .leftJoin(drivers, eq(trips.driverId, drivers.id));

        const rows = filters.length
            ? await base
                .where(filters.length === 1 ? filters[0] : and(...filters))
                .orderBy(sql`${trips.createdAt} desc`)
            : await base.orderBy(sql`${trips.createdAt} desc`);

        res.json({ trips: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });

        const [trip] = await db.select().from(trips).where(eq(trips.id, id));
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        res.json({ trip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });
        const [trip] = await db.select().from(trips).where(eq(trips.id, id));
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        if (trip.status !== 'draft') {
            return res.status(400).json({ error: 'Only draft trips can be edited' });
        }
        const {
            source,
            destination,
            vehicleId,
            driverId,
            cargoWeight,
            plannedDistance,
            revenue,
        } = req.body;
        const updateData = {};
        if (source !== undefined) updateData.source = source;
        if (destination !== undefined) updateData.destination = destination;
        if (plannedDistance !== undefined) {
            if (plannedDistance !== '' && !isNonNegativeNumber(plannedDistance)) {
                return res.status(400).json({ error: 'Planned distance must be a non-negative number' });
            }
            updateData.plannedDistance = plannedDistance === '' ? null : String(plannedDistance);
        }
        if (revenue !== undefined) {
            if (revenue !== '' && !isNonNegativeNumber(revenue)) {
                return res.status(400).json({ error: 'Revenue must be a non-negative number' });
            }
            updateData.revenue = revenue === '' ? null : String(revenue);
        }
        const vId = vehicleId !== undefined ? parseId(vehicleId) : trip.vehicleId;
        const dId = driverId !== undefined ? parseId(driverId) : trip.driverId;
        const weight = cargoWeight !== undefined ? cargoWeight : trip.cargoWeight;
        if (vehicleId !== undefined || driverId !== undefined || cargoWeight !== undefined) {
            if (!vId || !dId) {
                return res.status(400).json({ error: 'A valid vehicleId and driverId are required' });
            }
            if (!isPositiveNumber(weight)) {
                return res.status(400).json({ error: 'Cargo weight must be greater than 0' });
            }
            const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vId));
            const [driver] = await db.select().from(drivers).where(eq(drivers.id, dId));
            if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
            if (!driver) return res.status(404).json({ error: 'Driver not found' });
            if (vId !== trip.vehicleId || dId !== trip.driverId || weight !== trip.cargoWeight) {
                const tempVehicle = { ...vehicle };
                const tempDriver = { ...driver };
                if (vId === trip.vehicleId) tempVehicle.status = 'available';
                if (dId === trip.driverId) tempDriver.status = 'available';
                const violation = validateAssignment(tempVehicle, tempDriver, weight);
                if (violation) return res.status(409).json({ error: violation });
            }
            updateData.vehicleId = vId;
            updateData.driverId = dId;
            updateData.cargoWeight = String(weight);
        }
        const [updatedTrip] = await db.update(trips).set(updateData).where(eq(trips.id, id)).returning();
        res.json({ trip: updatedTrip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid trip id' });
        const [trip] = await db.select().from(trips).where(eq(trips.id, id));
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        if (trip.status !== 'draft' && trip.status !== 'cancelled') {
            return res.status(400).json({ error: 'Only draft or cancelled trips can be deleted' });
        }
        await db.delete(trips).where(eq(trips.id, id));
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
