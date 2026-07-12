/** Mirrors tripStatusEnum in server/src/db/schema.js */
export const TRIP_STATUS = {
  DRAFT: "draft",
  DISPATCHED: "dispatched",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TRIP_STATUS_LABELS = {
  [TRIP_STATUS.DRAFT]: "Draft",
  [TRIP_STATUS.DISPATCHED]: "Dispatched",
  [TRIP_STATUS.COMPLETED]: "Completed",
  [TRIP_STATUS.CANCELLED]: "Cancelled",
};

/** The lifecycle order shown by the stepper: Draft → Dispatched → Completed. */
export const TRIP_LIFECYCLE = [
  TRIP_STATUS.DRAFT,
  TRIP_STATUS.DISPATCHED,
  TRIP_STATUS.COMPLETED,
];
