/** Mirrors driverStatusEnum in server/src/db/schema.js */
export const DRIVER_STATUS = {
  AVAILABLE: "available",
  ON_TRIP: "on_trip",
  OFF_DUTY: "off_duty",
  SUSPENDED: "suspended",
};

export const DRIVER_STATUS_LABELS = {
  [DRIVER_STATUS.AVAILABLE]: "Available",
  [DRIVER_STATUS.ON_TRIP]: "On trip",
  [DRIVER_STATUS.OFF_DUTY]: "Off duty",
  [DRIVER_STATUS.SUSPENDED]: "Suspended",
};

/**
 * Settable by hand. 'on_trip' is owned by the trip state machine — the API
 * rejects an attempt to set it directly, and refuses any status change while
 * the driver is mid-trip.
 */
export const MANUAL_DRIVER_STATUSES = [
  DRIVER_STATUS.AVAILABLE,
  DRIVER_STATUS.OFF_DUTY,
  DRIVER_STATUS.SUSPENDED,
];

export const LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "HGMV", "HTV"];

/** A driver is blocked from dispatch if their licence has lapsed. */
export const isLicenseExpired = (driver) =>
  Boolean(driver.licenseExpiryDate) &&
  driver.licenseExpiryDate < new Date().toISOString().slice(0, 10);
