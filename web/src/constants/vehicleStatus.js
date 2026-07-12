/** Mirrors vehicleStatusEnum in server/src/db/schema.js */
export const VEHICLE_STATUS = {
  AVAILABLE: "available",
  ON_TRIP: "on_trip",
  IN_SHOP: "in_shop",
  RETIRED: "retired",
};

export const VEHICLE_STATUS_LABELS = {
  [VEHICLE_STATUS.AVAILABLE]: "Available",
  [VEHICLE_STATUS.ON_TRIP]: "On trip",
  [VEHICLE_STATUS.IN_SHOP]: "In shop",
  [VEHICLE_STATUS.RETIRED]: "Retired",
};

/**
 * Only these can be set by hand. The server moves a vehicle to on_trip when a
 * trip is dispatched and to in_shop when a maintenance log is opened.
 */
export const MANUAL_VEHICLE_STATUSES = [
  VEHICLE_STATUS.AVAILABLE,
  VEHICLE_STATUS.RETIRED,
];
