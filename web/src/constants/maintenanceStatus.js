/** Mirrors maintenanceStatusEnum in server/src/db/schema.js */
export const MAINTENANCE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
};

export const MAINTENANCE_STATUS_LABELS = {
  [MAINTENANCE_STATUS.OPEN]: "Open",
  [MAINTENANCE_STATUS.CLOSED]: "Closed",
};
