import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import { VIEW_ROLES, WRITE_ROLES } from "@/lib/permissions";

import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";

import DashboardPage from "@/pages/dashboard/Dashboard";

import VehicleListPage from "@/pages/vehicles/VehicleListPage";
import VehicleDetailsPage from "@/pages/vehicles/VehicleDetailsPage";

import DriverListPage from "@/pages/drivers/DriverListPage";
import DriverDetailsPage from "@/pages/drivers/DriverDetailsPage";

import TripListPage from "@/pages/trips/TripListPage";
import TripDetailsPage from "@/pages/trips/TripDetailsPage";

import MaintenanceListPage from "@/pages/maintenance/MaintenanceListPage";
import MaintenanceDetailsPage from "@/pages/maintenance/MaintenanceDetailsPage";

import FuelLogListPage from "@/pages/fuel/FuelLogListPage";

import ExpenseListPage from "@/pages/expenses/ExpenseListPage";

import ReportsPage from "@/pages/reports/Reports";

import SettingsPage from "@/pages/settings/Settings";

import NotFoundPage from "@/pages/NotFoundPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Every resource creates and edits through a dialog on its list page,
              so there are no /new or /:id/edit routes anywhere below. */}

          {/* ── Vehicles ────────────────────────────────── */}
          <Route path="/vehicles" element={<RoleRoute allow={VIEW_ROLES.vehicles} />}>
            <Route index element={<VehicleListPage />} />
            <Route path=":id" element={<VehicleDetailsPage />} />
          </Route>

          {/* ── Drivers ─────────────────────────────────── */}
          <Route path="/drivers" element={<RoleRoute allow={VIEW_ROLES.drivers} />}>
            <Route index element={<DriverListPage />} />
            <Route path=":id" element={<DriverDetailsPage />} />
          </Route>

          {/* ── Trips ───────────────────────────────────── */}
          <Route path="/trips" element={<RoleRoute allow={VIEW_ROLES.trips} />}>
            <Route index element={<TripListPage />} />
            <Route path=":id" element={<TripDetailsPage />} />
          </Route>

          {/* ── Maintenance ─────────────────────────────── */}
          <Route
            path="/maintenance"
            element={<RoleRoute allow={VIEW_ROLES.maintenance} />}
          >
            <Route index element={<MaintenanceListPage />} />
            <Route path=":id" element={<MaintenanceDetailsPage />} />
          </Route>

          {/* ── Fuel Logs ───────────────────────────────── */}
          <Route path="/fuel" element={<RoleRoute allow={VIEW_ROLES.fuelLogs} />}>
            <Route index element={<FuelLogListPage />} />
          </Route>

          {/* ── Expenses ────────────────────────────────── */}
          <Route path="/expenses" element={<RoleRoute allow={VIEW_ROLES.expenses} />}>
            <Route index element={<ExpenseListPage />} />
          </Route>

          {/* ── Reports ─────────────────────────────────── */}
          <Route path="/reports" element={<RoleRoute allow={VIEW_ROLES.reports} />}>
            <Route index element={<ReportsPage />} />
          </Route>

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
