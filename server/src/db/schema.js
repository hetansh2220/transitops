import { sql } from "drizzle-orm";
import {
    pgTable,
    serial,
    varchar,
    integer,
    numeric,
    timestamp,
    pgEnum,
    date,
    uniqueIndex,
} from "drizzle-orm/pg-core";



export const userRoleEnum = pgEnum("user_role", [
    "fleet_manager",
    "dispatcher",
    "safety_officer",
    "financial_analyst",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
    "available",
    "on_trip",
    "in_shop",
    "retired",
]);

export const driverStatusEnum = pgEnum("driver_status", [
    "available",
    "on_trip",
    "off_duty",
    "suspended",
]);

export const tripStatusEnum = pgEnum("trip_status", [
    "draft",
    "dispatched",
    "completed",
    "cancelled",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
    "open",
    "closed",
]);

export const expenseTypeEnum = pgEnum("expense_type", [
    "toll",
    "parking",
    "permit",
    "other",
]);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
    id: serial("id").primaryKey(),
    registrationNumber: varchar("registration_number", { length: 20 })
        .notNull()
        .unique(),
    name: varchar("name", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }),
    type: varchar("type", { length: 50 }).notNull(),
    region: varchar("region", { length: 50 }),
    maxLoadCapacity: numeric("max_load_capacity", {
        precision: 10,
        scale: 2,
    }).notNull(),
    odometer: numeric("odometer", { precision: 10, scale: 2 })
        .default("0")
        .notNull(),
    acquisitionCost: numeric("acquisition_cost", { precision: 12, scale: 2 }),
    status: vehicleStatusEnum("status").default("available").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    name: varchar("name", { length: 100 }).notNull(),
    licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
    licenseCategory: varchar("license_category", { length: 20 }).notNull(),
    licenseExpiryDate: date("license_expiry_date").notNull(),
    contactNumber: varchar("contact_number", { length: 20 }),
    safetyScore: numeric("safety_score", { precision: 5, scale: 2 })
        .default("100")
        .notNull(),
    status: driverStatusEnum("status").default("available").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 150 }).notNull(),
    destination: varchar("destination", { length: 150 }).notNull(),
    vehicleId: integer("vehicle_id")
        .references(() => vehicles.id)
        .notNull(),
    driverId: integer("driver_id")
        .references(() => drivers.id)
        .notNull(),
    cargoWeight: numeric("cargo_weight", { precision: 10, scale: 2 }).notNull(),
    plannedDistance: numeric("planned_distance", { precision: 10, scale: 2 }),

    revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
    startOdometer: numeric("start_odometer", { precision: 10, scale: 2 }),
    endOdometer: numeric("end_odometer", { precision: 10, scale: 2 }),
    actualDistance: numeric("actual_distance", { precision: 10, scale: 2 }),
    status: tripStatusEnum("status").default("draft").notNull(),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    dispatchedAt: timestamp("dispatched_at"),
    completedAt: timestamp("completed_at"),
});

export const maintenanceLogs = pgTable(
    "maintenance_logs",
    {
        id: serial("id").primaryKey(),
        vehicleId: integer("vehicle_id")
            .references(() => vehicles.id)
            .notNull(),
        serviceType: varchar("service_type", { length: 100 }).notNull(),
        cost: numeric("cost", { precision: 10, scale: 2 }).default("0").notNull(),
        date: date("date").notNull(),
        status: maintenanceStatusEnum("status").default("open").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        closedAt: timestamp("closed_at"),
    },
    (table) => [

        uniqueIndex("maintenance_one_open_per_vehicle")
            .on(table.vehicleId)
            .where(sql`${table.status} = 'open'`),
    ]
);

export const fuelLogs = pgTable("fuel_logs", {
    id: serial("id").primaryKey(),
    vehicleId: integer("vehicle_id")
        .references(() => vehicles.id)
        .notNull(),
    tripId: integer("trip_id").references(() => trips.id),
    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
    id: serial("id").primaryKey(),
    vehicleId: integer("vehicle_id")
        .references(() => vehicles.id)
        .notNull(),
    tripId: integer("trip_id").references(() => trips.id),
    type: expenseTypeEnum("type").notNull(),
    description: varchar("description", { length: 255 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
