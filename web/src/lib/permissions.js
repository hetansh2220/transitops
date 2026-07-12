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

/**
 * Which modules each role sees in the nav, per the RBAC matrix in the wireframe.
 *
 * This is decluttering, not security: the API lets every authenticated role READ
 * every resource, so a hidden page is still reachable by URL until RoleRoute
 * bounces it. requireRole() on the server is the only real gate.
 *
 * A role may see a page it cannot write to — a dispatcher needs the vehicle
 * registry for context even though only a fleet manager can edit it.
 */
export const VIEW_ROLES = {
  vehicles: [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.FINANCIAL_ANALYST],
  drivers: [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER],
  trips: [ROLES.DISPATCHER, ROLES.SAFETY_OFFICER],
  maintenance: [ROLES.FLEET_MANAGER],
  fuelLogs: [ROLES.FINANCIAL_ANALYST],
  expenses: [ROLES.FINANCIAL_ANALYST],
  reports: [ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
};

/** Dashboard and Settings have no entry — every role gets them. */
export const canView = (user, resource) =>
  Boolean(user) && (VIEW_ROLES[resource] ?? [user.role]).includes(user.role);

export const ROLE_LABELS = {
  [ROLES.FLEET_MANAGER]: "Fleet Manager",
  [ROLES.DISPATCHER]: "Dispatcher",
  [ROLES.SAFETY_OFFICER]: "Safety Officer",
  [ROLES.FINANCIAL_ANALYST]: "Financial Analyst",
};
