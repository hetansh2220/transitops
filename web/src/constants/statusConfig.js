/**
 * statusConfig.js
 *
 * Single source of truth for every status value in the TransitOps backend.
 * Maps each status string → { label, className, dotClassName }
 *
 * Visual tier system (monochrome, light & dark aware):
 * ─────────────────────────────────────────────────────
 *  ACTIVE / POSITIVE  →  filled dark  (bg-foreground, text-background)
 *  IN-PROGRESS        →  medium fill  (bg-foreground/15, text-foreground)
 *  NEUTRAL / INFO     →  light fill   (bg-muted, text-muted-foreground)
 *  WARNING / CAUTION  →  outlined     (border-foreground/40, text-foreground)
 *  INACTIVE / ENDED   →  ghost/dim    (bg-muted/50, text-muted-foreground/60)
 *
 * The dot color is always one step darker than the badge background
 * to maintain hierarchy without introducing colour.
 *
 * Enums covered (from schema.js):
 *   vehicleStatusEnum  : available | on_trip | in_shop | retired
 *   driverStatusEnum   : available | on_trip | off_duty | suspended
 *   tripStatusEnum     : draft | dispatched | completed | cancelled
 *   maintenanceStatusEnum : open | closed
 *   expenseTypeEnum    : toll | parking | permit | other  (used as labels only)
 */

export const STATUS_CONFIG = {
  // ── Vehicle statuses ──────────────────────────────────────────────────────
  available: {
    label: "Available",
    // Dark filled — highest positive signal
    className:
      "bg-foreground text-background border-transparent",
    dotClassName: "bg-background/60",
  },
  on_trip: {
    label: "On Trip",
    // Medium-dark fill — active but occupied
    className:
      "bg-foreground/10 text-foreground border-foreground/15",
    dotClassName: "bg-foreground/70",
  },
  in_shop: {
    label: "In Shop",
    // Outlined — caution/warning tier
    className:
      "bg-transparent text-foreground border-foreground/35",
    dotClassName: "bg-foreground/50",
  },
  retired: {
    label: "Retired",
    // Ghost / dim — inactive, ended lifecycle
    className:
      "bg-muted/60 text-muted-foreground border-transparent",
    dotClassName: "bg-muted-foreground/50",
  },

  // ── Driver statuses ───────────────────────────────────────────────────────
  // "available" is shared with vehicle — same config above
  // "on_trip"   is shared with vehicle — same config above
  off_duty: {
    label: "Off Duty",
    // Light muted — neutral, not alarming
    className:
      "bg-muted text-muted-foreground border-transparent",
    dotClassName: "bg-muted-foreground/60",
  },
  suspended: {
    label: "Suspended",
    // Outlined with stronger border — negative / blocked
    className:
      "bg-foreground/5 text-foreground border-foreground/50",
    dotClassName: "bg-foreground",
  },

  // ── Trip statuses ─────────────────────────────────────────────────────────
  draft: {
    label: "Draft",
    // Lightest — not yet active
    className:
      "bg-muted text-muted-foreground border-transparent",
    dotClassName: "bg-muted-foreground/50",
  },
  dispatched: {
    label: "Dispatched",
    // Medium active — in flight
    className:
      "bg-foreground/10 text-foreground border-foreground/15",
    dotClassName: "bg-foreground/70",
  },
  completed: {
    label: "Completed",
    // Dark filled — terminal positive state
    className:
      "bg-foreground text-background border-transparent",
    dotClassName: "bg-background/60",
  },
  cancelled: {
    label: "Cancelled",
    // Struck-through ghost — terminal negative state
    className:
      "bg-muted/60 text-muted-foreground/70 border-transparent line-through",
    dotClassName: "bg-muted-foreground/40",
  },

  // ── Maintenance statuses ──────────────────────────────────────────────────
  open: {
    label: "Open",
    // Outlined — requires attention
    className:
      "bg-transparent text-foreground border-foreground/40",
    dotClassName: "bg-foreground/60",
  },
  closed: {
    label: "Closed",
    // Ghost — resolved, no further action
    className:
      "bg-muted/60 text-muted-foreground border-transparent",
    dotClassName: "bg-muted-foreground/50",
  },
};

/**
 * Fallback config for unknown/unrecognised status values.
 */
export const STATUS_FALLBACK = {
  label: null, // will display the raw value
  className: "bg-muted text-muted-foreground border-transparent",
  dotClassName: "bg-muted-foreground/50",
};
