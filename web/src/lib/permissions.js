/**
 * Mirrors the requireRole() rules in server/src/routes/*.js.
 *
 * This is UX only — it exists so we don't render buttons that are guaranteed
 * to 403. The backend is the real gate. Keep this in sync with the routes.
 */
export const ROLES = {
  FLEET_MANAGER: "fleet_manager",
  DISPATCHER: "dispatcher",
  SAFETY_OFFICER: "safety_officer",
  FINANCIAL_ANALYST: "financial_analyst",
};

/** Who may write each resource. Reads are open to every authenticated role. */
export const WRITE_ROLES = {
  vehicles: [ROLES.FLEET_MANAGER],
  drivers: [ROLES.SAFETY_OFFICER, ROLES.FLEET_MANAGER],
  trips: [ROLES.DISPATCHER],
  maintenance: [ROLES.FLEET_MANAGER],
  fuelLogs: [ROLES.FINANCIAL_ANALYST],
  expenses: [ROLES.FINANCIAL_ANALYST],
};

export const canWrite = (user, resource) =>
  Boolean(user) && (WRITE_ROLES[resource] ?? []).includes(user.role);

export const ROLE_LABELS = {
  [ROLES.FLEET_MANAGER]: "Fleet Manager",
  [ROLES.DISPATCHER]: "Dispatcher",
  [ROLES.SAFETY_OFFICER]: "Safety Officer",
  [ROLES.FINANCIAL_ANALYST]: "Financial Analyst",
};
