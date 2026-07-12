CREATE TYPE "driver_status" AS ENUM('available', 'on_trip', 'off_duty', 'suspended');--> statement-breakpoint
CREATE TYPE "expense_type" AS ENUM('toll', 'parking', 'permit', 'other');--> statement-breakpoint
CREATE TYPE "maintenance_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "trip_status" AS ENUM('draft', 'dispatched', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "vehicle_status" AS ENUM('available', 'on_trip', 'in_shop', 'retired');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY,
	"user_id" integer,
	"name" varchar(100) NOT NULL,
	"license_number" varchar(50) NOT NULL UNIQUE,
	"license_category" varchar(20) NOT NULL,
	"license_expiry_date" date NOT NULL,
	"contact_number" varchar(20),
	"safety_score" numeric(5,2) DEFAULT '100' NOT NULL,
	"status" "driver_status" DEFAULT 'available'::"driver_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY,
	"vehicle_id" integer NOT NULL,
	"trip_id" integer,
	"type" "expense_type" NOT NULL,
	"description" varchar(255),
	"amount" numeric(10,2) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fuel_logs" (
	"id" serial PRIMARY KEY,
	"vehicle_id" integer NOT NULL,
	"trip_id" integer,
	"liters" numeric(10,2) NOT NULL,
	"cost" numeric(10,2) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" serial PRIMARY KEY,
	"vehicle_id" integer NOT NULL,
	"service_type" varchar(100) NOT NULL,
	"cost" numeric(10,2) DEFAULT '0' NOT NULL,
	"date" date NOT NULL,
	"status" "maintenance_status" DEFAULT 'open'::"maintenance_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY,
	"source" varchar(150) NOT NULL,
	"destination" varchar(150) NOT NULL,
	"vehicle_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"cargo_weight" numeric(10,2) NOT NULL,
	"planned_distance" numeric(10,2),
	"revenue" numeric(12,2) DEFAULT '0' NOT NULL,
	"start_odometer" numeric(10,2),
	"end_odometer" numeric(10,2),
	"actual_distance" numeric(10,2),
	"status" "trip_status" DEFAULT 'draft'::"trip_status" NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dispatched_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY,
	"registration_number" varchar(20) NOT NULL UNIQUE,
	"name" varchar(100) NOT NULL,
	"model" varchar(100),
	"type" varchar(50) NOT NULL,
	"region" varchar(50),
	"max_load_capacity" numeric(10,2) NOT NULL,
	"odometer" numeric(10,2) DEFAULT '0' NOT NULL,
	"acquisition_cost" numeric(12,2),
	"status" "vehicle_status" DEFAULT 'available'::"vehicle_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "maintenance_one_open_per_vehicle" ON "maintenance_logs" ("vehicle_id") WHERE "status" = 'open';--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id");--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id");--> statement-breakpoint
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_trips_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id");--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id");--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id");--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id");--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");