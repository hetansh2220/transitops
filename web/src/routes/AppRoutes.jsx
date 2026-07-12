import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Guards
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import { WRITE_ROLES } from "@/lib/permissions";

// Auth pages
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";

// Dashboard
import DashboardPage from "@/pages/dashboard/Dashboard";

// Vehicles
import VehicleListPage from "@/pages/vehicles/VehicleListPage";
import VehicleDetailsPage from "@/pages/vehicles/VehicleDetailsPage";

// Drivers
import DriverListPage from "@/pages/drivers/DriverListPage";
import DriverDetailsPage from "@/pages/drivers/DriverDetailsPage";
import DriverFormPage from "@/pages/drivers/DriverFormPage";

// Trips
import TripListPage from "@/pages/trips/TripListPage";
import TripDetailsPage from "@/pages/trips/TripDetailsPage";
import TripFormPage from "@/pages/trips/TripFormPage";

// Maintenance
import MaintenanceListPage from "@/pages/maintenance/MaintenanceListPage";
import MaintenanceDetailsPage from "@/pages/maintenance/MaintenanceDetailsPage";
import MaintenanceFormPage from "@/pages/maintenance/MaintenanceFormPage";

// Fuel Logs
import FuelLogListPage from "@/pages/fuel/FuelLogListPage";
import FuelLogFormPage from "@/pages/fuel/FuelLogFormPage";

// Expenses
import ExpenseListPage from "@/pages/expenses/ExpenseListPage";
import ExpenseFormPage from "@/pages/expenses/ExpenseFormPage";

// Reports
import ReportsPage from "@/pages/reports/Reports";

// Settings
import SettingsPage from "@/pages/settings/Settings";

// 404
import NotFoundPage from "@/pages/NotFoundPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ─────────────────────────────────────────────────
          AUTH ROUTES
          Unauthenticated pages rendered inside AuthLayout.
          ───────────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ─────────────────────────────────────────────────
          AUTHENTICATED ROUTES
          ProtectedRoute redirects to /login when signed out.
          RoleRoute mirrors requireRole() in server/src/routes —
          it hides UI only; the backend is the real gate.
          ───────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Root redirect → Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* ── Vehicles ────────────────────────────────── */}
          {/* Create/edit happen in a dialog on the list page, so there are no
              /new or /:id/edit routes here. */}
          <Route path="/vehicles">
            <Route index element={<VehicleListPage />} />
            <Route path=":id" element={<VehicleDetailsPage />} />
          </Route>

          {/* ── Drivers ─────────────────────────────────── */}
          <Route path="/drivers">
            <Route index element={<DriverListPage />} />
            <Route path=":id" element={<DriverDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.drivers} />}>
              <Route path="new" element={<DriverFormPage />} />
              <Route path=":id/edit" element={<DriverFormPage />} />
            </Route>
          </Route>

          {/* ── Trips ───────────────────────────────────── */}
          <Route path="/trips">
            <Route index element={<TripListPage />} />
            <Route path=":id" element={<TripDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.trips} />}>
              <Route path="new" element={<TripFormPage />} />
              <Route path=":id/edit" element={<TripFormPage />} />
            </Route>
          </Route>

          {/* ── Maintenance ─────────────────────────────── */}
          <Route path="/maintenance">
            <Route index element={<MaintenanceListPage />} />
            <Route path=":id" element={<MaintenanceDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.maintenance} />}>
              <Route path="new" element={<MaintenanceFormPage />} />
            </Route>
          </Route>

          {/* ── Fuel Logs ───────────────────────────────── */}
          <Route path="/fuel">
            <Route index element={<FuelLogListPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.fuelLogs} />}>
              <Route path="new" element={<FuelLogFormPage />} />
            </Route>
          </Route>

          {/* ── Expenses ────────────────────────────────── */}
          <Route path="/expenses">
            <Route index element={<ExpenseListPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.expenses} />}>
              <Route path="new" element={<ExpenseFormPage />} />
            </Route>
          </Route>

          {/* ── Reports ─────────────────────────────────── */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* ── Settings ────────────────────────────────── */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ─────────────────────────────────────────────────
          CATCH-ALL — 404
          ───────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
