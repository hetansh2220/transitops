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
import DriverFormPage from "@/pages/drivers/DriverFormPage";

import TripListPage from "@/pages/trips/TripListPage";
import TripDetailsPage from "@/pages/trips/TripDetailsPage";
import TripFormPage from "@/pages/trips/TripFormPage";

import MaintenanceListPage from "@/pages/maintenance/MaintenanceListPage";
import MaintenanceDetailsPage from "@/pages/maintenance/MaintenanceDetailsPage";
import MaintenanceFormPage from "@/pages/maintenance/MaintenanceFormPage";

import FuelLogListPage from "@/pages/fuel/FuelLogListPage";
import FuelLogFormPage from "@/pages/fuel/FuelLogFormPage";

import ExpenseListPage from "@/pages/expenses/ExpenseListPage";
import ExpenseFormPage from "@/pages/expenses/ExpenseFormPage";

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

          <Route path="/vehicles">
          {/* ── Vehicles ────────────────────────────────── */}
          {/* Create/edit happen in a dialog on the list page, so there are no
              /new or /:id/edit routes here. */}
          <Route path="/vehicles" element={<RoleRoute allow={VIEW_ROLES.vehicles} />}>
            <Route index element={<VehicleListPage />} />
            <Route path=":id" element={<VehicleDetailsPage />} />
          </Route>

          <Route path="/drivers">
          {/* ── Drivers ─────────────────────────────────── */}
          <Route path="/drivers" element={<RoleRoute allow={VIEW_ROLES.drivers} />}>
            <Route index element={<DriverListPage />} />
            <Route path=":id" element={<DriverDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.drivers} />}>
              <Route path="new" element={<DriverFormPage />} />
              <Route path=":id/edit" element={<DriverFormPage />} />
            </Route>
          </Route>

          <Route path="/trips">
          {/* ── Trips ───────────────────────────────────── */}
          <Route path="/trips" element={<RoleRoute allow={VIEW_ROLES.trips} />}>
            <Route index element={<TripListPage />} />
            <Route path=":id" element={<TripDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.trips} />}>
              <Route path="new" element={<TripFormPage />} />
              <Route path=":id/edit" element={<TripFormPage />} />
            </Route>
          </Route>

          <Route path="/maintenance">
          {/* ── Maintenance ─────────────────────────────── */}
          <Route
            path="/maintenance"
            element={<RoleRoute allow={VIEW_ROLES.maintenance} />}
          >
            <Route index element={<MaintenanceListPage />} />
            <Route path=":id" element={<MaintenanceDetailsPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.maintenance} />}>
              <Route path="new" element={<MaintenanceFormPage />} />
            </Route>
          </Route>

          <Route path="/fuel">
          {/* ── Fuel Logs ───────────────────────────────── */}
          <Route path="/fuel" element={<RoleRoute allow={VIEW_ROLES.fuelLogs} />}>
            <Route index element={<FuelLogListPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.fuelLogs} />}>
              <Route path="new" element={<FuelLogFormPage />} />
              <Route path=":id/edit" element={<FuelLogFormPage />} />
            </Route>
          </Route>

          <Route path="/expenses">
          {/* ── Expenses ────────────────────────────────── */}
          <Route path="/expenses" element={<RoleRoute allow={VIEW_ROLES.expenses} />}>
            <Route index element={<ExpenseListPage />} />
            <Route element={<RoleRoute allow={WRITE_ROLES.expenses} />}>
              <Route path="new" element={<ExpenseFormPage />} />
              <Route path=":id/edit" element={<ExpenseFormPage />} />
            </Route>
          </Route>

          <Route path="/reports" element={<ReportsPage />} />
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
