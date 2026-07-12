import { ROLES } from "@/lib/permissions";

/**
 * The four seeded demo accounts (server/src/db/seed.js). Shown in a banner so a
 * reviewer can switch roles without hunting for credentials.
 *
 * Obviously this is a demo affordance, not something you ship — it renders a
 * shared password in plain HTML. Set VITE_DEMO_MODE=false to hide it.
 */
export const DEMO_PASSWORD = "password123";

export const DEMO_ACCOUNTS = [
  { role: ROLES.FLEET_MANAGER, email: "manager@transitops.demo" },
  { role: ROLES.DISPATCHER, email: "dispatcher@transitops.demo" },
  { role: ROLES.SAFETY_OFFICER, email: "safety@transitops.demo" },
  { role: ROLES.FINANCIAL_ANALYST, email: "analyst@transitops.demo" },
];

/** Off only when explicitly disabled, so the banner is there for the demo by default. */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";
