import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import db from '../config/db.js';
import {
    users,
    vehicles,
    drivers,
    trips,
    fuelLogs,
    maintenanceLogs,
    expenses,
} from './schema.js';

// Everything this script creates is prefixed so `npm run seed:reset` can remove
// exactly the demo data and nothing a teammate entered by hand.
const REG_PREFIX = 'TO-';
const LICENSE_PREFIX = 'TO-DL-';
const EMAIL_DOMAIN = '@transitops.demo';

const PASSWORD = 'password123';

const USERS = [
    { name: 'Priya Fleet', email: `manager${EMAIL_DOMAIN}`, role: 'fleet_manager' },
    { name: 'Raven K.', email: `dispatcher${EMAIL_DOMAIN}`, role: 'dispatcher' },
    { name: 'Sam Safety', email: `safety${EMAIL_DOMAIN}`, role: 'safety_officer' },
    { name: 'Neel Finance', email: `analyst${EMAIL_DOMAIN}`, role: 'financial_analyst' },
];

const VEHICLES = [
    { registrationNumber: `${REG_PREFIX}VAN-05`, name: 'Van-05', model: 'Force Traveller', type: 'Van', region: 'West', maxLoadCapacity: '500', odometer: '48200', acquisitionCost: '850000' },
    { registrationNumber: `${REG_PREFIX}VAN-06`, name: 'Van-06', model: 'Force Traveller', type: 'Van', region: 'West', maxLoadCapacity: '500', odometer: '31400', acquisitionCost: '840000' },
    { registrationNumber: `${REG_PREFIX}TRK-01`, name: 'Truck-01', model: 'Tata LPT 1613', type: 'Truck', region: 'North', maxLoadCapacity: '9000', odometer: '112500', acquisitionCost: '2600000' },
    { registrationNumber: `${REG_PREFIX}TRK-02`, name: 'Truck-02', model: 'Ashok Leyland 1920', type: 'Truck', region: 'North', maxLoadCapacity: '12000', odometer: '87600', acquisitionCost: '3100000' },
    { registrationNumber: `${REG_PREFIX}TRK-03`, name: 'Truck-03', model: 'Tata LPT 1613', type: 'Truck', region: 'South', maxLoadCapacity: '9000', odometer: '64300', acquisitionCost: '2550000' },
    { registrationNumber: `${REG_PREFIX}MIN-01`, name: 'Mini-01', model: 'Tata Ace', type: 'Mini', region: 'West', maxLoadCapacity: '750', odometer: '22100', acquisitionCost: '520000' },
    { registrationNumber: `${REG_PREFIX}MIN-02`, name: 'Mini-02', model: 'Mahindra Jeeto', type: 'Mini', region: 'South', maxLoadCapacity: '700', odometer: '18900', acquisitionCost: '495000' },
    { registrationNumber: `${REG_PREFIX}VAN-07`, name: 'Van-07', model: 'Maruti Eeco', type: 'Van', region: 'East', maxLoadCapacity: '600', odometer: '9800', acquisitionCost: '610000' },
    { registrationNumber: `${REG_PREFIX}TRK-04`, name: 'Truck-04', model: 'Eicher Pro 2049', type: 'Truck', region: 'East', maxLoadCapacity: '5000', odometer: '156000', acquisitionCost: '1900000', status: 'retired' },
    { registrationNumber: `${REG_PREFIX}MIN-03`, name: 'Mini-03', model: 'Tata Ace', type: 'Mini', region: 'North', maxLoadCapacity: '750', odometer: '41200', acquisitionCost: '515000' },
];

const DRIVERS = [
    { name: 'Alex Mathew', licenseNumber: `${LICENSE_PREFIX}0001`, licenseCategory: 'LMV', licenseExpiryDate: '2029-04-18', contactNumber: '9876500001', safetyScore: '94.50' },
    { name: 'Ravi Chauhan', licenseNumber: `${LICENSE_PREFIX}0002`, licenseCategory: 'HMV', licenseExpiryDate: '2028-11-02', contactNumber: '9876500002', safetyScore: '88.00' },
    { name: 'Meera Iyer', licenseNumber: `${LICENSE_PREFIX}0003`, licenseCategory: 'HMV', licenseExpiryDate: '2030-06-30', contactNumber: '9876500003', safetyScore: '97.25' },
    { name: 'Imran Shaikh', licenseNumber: `${LICENSE_PREFIX}0004`, licenseCategory: 'LMV', licenseExpiryDate: '2027-09-14', contactNumber: '9876500004', safetyScore: '91.00' },
    // Deliberately expired — proves the licence-expiry rule blocks dispatch.
    { name: 'Tarun Bose', licenseNumber: `${LICENSE_PREFIX}0005`, licenseCategory: 'HMV', licenseExpiryDate: '2024-02-01', contactNumber: '9876500005', safetyScore: '72.00' },
    // Suspended — proves the suspension rule blocks dispatch.
    { name: 'Vikram Rao', licenseNumber: `${LICENSE_PREFIX}0006`, licenseCategory: 'HMV', licenseExpiryDate: '2029-01-20', contactNumber: '9876500006', safetyScore: '55.00', status: 'suspended' },
    { name: 'Sunita Desai', licenseNumber: `${LICENSE_PREFIX}0007`, licenseCategory: 'LMV', licenseExpiryDate: '2031-03-11', contactNumber: '9876500007', safetyScore: '99.00' },
    { name: 'Joseph Fernandes', licenseNumber: `${LICENSE_PREFIX}0008`, licenseCategory: 'HMV', licenseExpiryDate: '2028-08-25', contactNumber: '9876500008', safetyScore: '85.75', status: 'off_duty' },
];

// Completed trips: each carries revenue and a distance, and burns fuel. These
// are what make the ROI and fuel-efficiency reports non-empty.
const COMPLETED = [
    { v: 0, d: 0, source: 'Surat', destination: 'Mumbai', cargoWeight: '450', distance: '295', revenue: '24000', liters: '31.5', fuelCost: '3200' },
    { v: 0, d: 0, source: 'Mumbai', destination: 'Pune', cargoWeight: '380', distance: '150', revenue: '13500', liters: '16.0', fuelCost: '1650' },
    { v: 2, d: 1, source: 'Delhi', destination: 'Jaipur', cargoWeight: '8200', distance: '280', revenue: '46000', liters: '78.0', fuelCost: '7900' },
    { v: 2, d: 2, source: 'Jaipur', destination: 'Ahmedabad', cargoWeight: '7600', distance: '660', revenue: '92000', liters: '181.0', fuelCost: '18300' },
    { v: 3, d: 2, source: 'Delhi', destination: 'Lucknow', cargoWeight: '11000', distance: '550', revenue: '88000', liters: '160.5', fuelCost: '16200' },
    { v: 4, d: 1, source: 'Chennai', destination: 'Bengaluru', cargoWeight: '8800', distance: '350', revenue: '52000', liters: '96.0', fuelCost: '9700' },
    { v: 5, d: 3, source: 'Surat', destination: 'Vadodara', cargoWeight: '600', distance: '150', revenue: '9500', liters: '12.5', fuelCost: '1280' },
    { v: 6, d: 6, source: 'Kochi', destination: 'Coimbatore', cargoWeight: '520', distance: '190', revenue: '11800', liters: '15.0', fuelCost: '1540' },
    { v: 9, d: 3, source: 'Chandigarh', destination: 'Delhi', cargoWeight: '700', distance: '245', revenue: '15200', liters: '20.0', fuelCost: '2050' },
    { v: 1, d: 6, source: 'Pune', destination: 'Nashik', cargoWeight: '410', distance: '210', revenue: '16400', liters: '22.5', fuelCost: '2300' },
];

const MAINTENANCE = [
    { v: 0, serviceType: 'Oil change + filter', cost: '4200', date: '2026-05-14', status: 'closed' },
    { v: 2, serviceType: 'Brake pad replacement', cost: '18500', date: '2026-06-02', status: 'closed' },
    { v: 3, serviceType: 'Clutch overhaul', cost: '42000', date: '2026-06-21', status: 'closed' },
    { v: 4, serviceType: 'Tyre rotation', cost: '6800', date: '2026-07-01', status: 'closed' },
    // Open record -> Mini-02 must be in_shop and out of the dispatch pool.
    { v: 6, serviceType: 'Gearbox inspection', cost: '15000', date: '2026-07-10', status: 'open' },
];

const EXPENSES = [
    { v: 0, type: 'toll', description: 'NH-48 tolls', amount: '820', date: '2026-06-11' },
    { v: 2, type: 'toll', description: 'NH-8 tolls', amount: '1450', date: '2026-06-03' },
    { v: 3, type: 'permit', description: 'Interstate permit', amount: '3200', date: '2026-05-28' },
    { v: 4, type: 'parking', description: 'Depot parking', amount: '600', date: '2026-07-02' },
    { v: 5, type: 'toll', description: 'Expressway toll', amount: '340', date: '2026-06-25' },
];

const alreadySeeded = async () => {
    const [row] = await db
        .select({ n: sql`count(*)::int` })
        .from(vehicles)
        .where(sql`${vehicles.registrationNumber} like ${REG_PREFIX + '%'}`);
    return Number(row.n) > 0;
};

const reset = async () => {
    const ids = sql`(select id from ${vehicles} where ${vehicles.registrationNumber} like ${REG_PREFIX + '%'})`;
    await db.delete(expenses).where(sql`${expenses.vehicleId} in ${ids}`);
    await db.delete(fuelLogs).where(sql`${fuelLogs.vehicleId} in ${ids}`);
    await db.delete(maintenanceLogs).where(sql`${maintenanceLogs.vehicleId} in ${ids}`);
    await db.delete(trips).where(sql`${trips.vehicleId} in ${ids}`);
    await db.delete(vehicles).where(sql`${vehicles.registrationNumber} like ${REG_PREFIX + '%'}`);
    await db.delete(drivers).where(sql`${drivers.licenseNumber} like ${LICENSE_PREFIX + '%'}`);
    await db.delete(users).where(sql`${users.email} like ${'%' + EMAIL_DOMAIN}`);
    console.log('Removed existing demo data.');
};

const seed = async () => {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const createdUsers = await db
        .insert(users)
        .values(USERS.map((user) => ({ ...user, passwordHash })))
        .returning();

    const dispatcher = createdUsers.find((user) => user.role === 'dispatcher');

    const createdVehicles = await db.insert(vehicles).values(VEHICLES).returning();
    const createdDrivers = await db.insert(drivers).values(DRIVERS).returning();

    // Completed trips, with the vehicle's odometer walked forward trip by trip so
    // start/end readings stay consistent with the registry.
    const odometers = createdVehicles.map((vehicle) => Number(vehicle.odometer));

    for (const item of COMPLETED) {
        const vehicle = createdVehicles[item.v];
        const driver = createdDrivers[item.d];

        const start = odometers[item.v];
        const end = start + Number(item.distance);
        odometers[item.v] = end;

        const [trip] = await db
            .insert(trips)
            .values({
                source: item.source,
                destination: item.destination,
                vehicleId: vehicle.id,
                driverId: driver.id,
                cargoWeight: item.cargoWeight,
                plannedDistance: item.distance,
                actualDistance: item.distance,
                startOdometer: String(start),
                endOdometer: String(end),
                revenue: item.revenue,
                status: 'completed',
                createdBy: dispatcher?.id ?? null,
                dispatchedAt: new Date(),
                completedAt: new Date(),
            })
            .returning();

        await db.insert(fuelLogs).values({
            vehicleId: vehicle.id,
            tripId: trip.id,
            liters: item.liters,
            cost: item.fuelCost,
            date: '2026-06-15',
        });
    }

    // Push the walked-forward odometer back onto each vehicle.
    for (let i = 0; i < createdVehicles.length; i++) {
        await db
            .update(vehicles)
            .set({ odometer: String(odometers[i]) })
            .where(sql`${vehicles.id} = ${createdVehicles[i].id}`);
    }

    await db.insert(maintenanceLogs).values(
        MAINTENANCE.map((item) => ({
            vehicleId: createdVehicles[item.v].id,
            serviceType: item.serviceType,
            cost: item.cost,
            date: item.date,
            status: item.status,
            closedAt: item.status === 'closed' ? new Date() : null,
        }))
    );

    // The open maintenance record must leave its vehicle in the shop, exactly as
    // the API would.
    const inShop = MAINTENANCE.filter((item) => item.status === 'open');
    for (const item of inShop) {
        await db
            .update(vehicles)
            .set({ status: 'in_shop' })
            .where(sql`${vehicles.id} = ${createdVehicles[item.v].id}`);
    }

    await db.insert(expenses).values(
        EXPENSES.map((item) => ({
            vehicleId: createdVehicles[item.v].id,
            type: item.type,
            description: item.description,
            amount: item.amount,
            date: item.date,
        }))
    );

    // One live trip so the board is not empty: Van-06 + Sunita, dispatched.
    const liveVehicle = createdVehicles[1];
    const liveDriver = createdDrivers[6];

    await db.insert(trips).values({
        source: 'Mumbai',
        destination: 'Surat',
        vehicleId: liveVehicle.id,
        driverId: liveDriver.id,
        cargoWeight: '430',
        plannedDistance: '290',
        startOdometer: String(odometers[1]),
        revenue: '22000',
        status: 'dispatched',
        createdBy: dispatcher?.id ?? null,
        dispatchedAt: new Date(),
    });

    await db.update(vehicles).set({ status: 'on_trip' }).where(sql`${vehicles.id} = ${liveVehicle.id}`);
    await db.update(drivers).set({ status: 'on_trip' }).where(sql`${drivers.id} = ${liveDriver.id}`);

    // One draft so the "pending trips" KPI is non-zero.
    await db.insert(trips).values({
        source: 'Ahmedabad',
        destination: 'Udaipur',
        vehicleId: createdVehicles[5].id,
        driverId: createdDrivers[0].id,
        cargoWeight: '620',
        plannedDistance: '260',
        revenue: '17500',
        status: 'draft',
        createdBy: dispatcher?.id ?? null,
    });

    console.log(`
Seeded:
  ${createdUsers.length} users   (password for all: ${PASSWORD})
  ${createdVehicles.length} vehicles  (1 retired, 1 in shop, 1 on trip)
  ${createdDrivers.length} drivers   (1 expired licence, 1 suspended, 1 off duty)
  ${COMPLETED.length} completed trips + fuel logs, 1 dispatched, 1 draft
  ${MAINTENANCE.length} maintenance records (1 open)
  ${EXPENSES.length} expenses

Logins:
${USERS.map((user) => `  ${user.role.padEnd(18)} ${user.email}`).join('\n')}
`);
};

const run = async () => {
    const wantsReset = process.argv.includes('--reset');

    if (await alreadySeeded()) {
        if (!wantsReset) {
            console.log(
                'Demo data is already present. Re-run with --reset to replace it:\n  npm run seed:reset'
            );
            process.exit(0);
        }
        await reset();
    }

    await seed();
    process.exit(0);
};

run().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
});
