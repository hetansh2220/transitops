import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

// Auth pages
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";

// Dashboard
import DashboardPage from "@/pages/dashboard/Dashboard";

// Vehicles
import VehiclesListPage from "@/pages/vehicles/VehiclesListPage";
import VehicleDetailPage from "@/pages/vehicles/VehicleDetailPage";
import VehicleFormPage from "@/pages/vehicles/VehicleFormPage";

// Drivers
import DriversListPage from "@/pages/drivers/DriversListPage";
import DriverDetailPage from "@/pages/drivers/DriverDetailPage";
import DriverFormPage from "@/pages/drivers/DriverFormPage";

// Trips
import TripsListPage from "@/pages/trips/TripsListPage";
import TripDetailPage from "@/pages/trips/TripDetailPage";
import TripFormPage from "@/pages/trips/TripFormPage";

// Maintenance
import MaintenanceListPage from "@/pages/maintenance/MaintenanceListPage";
import MaintenanceDetailPage from "@/pages/maintenance/MaintenanceDetailPage";
import MaintenanceFormPage from "@/pages/maintenance/MaintenanceFormPage";

// Fuel Logs
import FuelLogsListPage from "@/pages/fuel/FuelLogsListPage";
import FuelLogFormPage from "@/pages/fuel/FuelLogFormPage";

// Expenses
import ExpensesListPage from "@/pages/expenses/ExpensesListPage";
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
          All protected pages nested under DashboardLayout.
          ProtectedRoute guard will be added here once
          AuthContext is wired up.
          ───────────────────────────────────────────────── */}
      <Route element={<DashboardLayout />}>
        {/* Root redirect → Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ── Vehicles ────────────────────────────────── */}
        <Route path="/vehicles">
          <Route index element={<VehiclesListPage />} />
          <Route path="new" element={<VehicleFormPage />} />
          <Route path=":id" element={<VehicleDetailPage />} />
          <Route path=":id/edit" element={<VehicleFormPage />} />
        </Route>

        {/* ── Drivers ─────────────────────────────────── */}
        <Route path="/drivers">
          <Route index element={<DriversListPage />} />
          <Route path="new" element={<DriverFormPage />} />
          <Route path=":id" element={<DriverDetailPage />} />
          <Route path=":id/edit" element={<DriverFormPage />} />
        </Route>

        {/* ── Trips ───────────────────────────────────── */}
        <Route path="/trips">
          <Route index element={<TripsListPage />} />
          <Route path="new" element={<TripFormPage />} />
          <Route path=":id" element={<TripDetailPage />} />
          <Route path=":id/edit" element={<TripFormPage />} />
        </Route>

        {/* ── Maintenance ─────────────────────────────── */}
        <Route path="/maintenance">
          <Route index element={<MaintenanceListPage />} />
          <Route path="new" element={<MaintenanceFormPage />} />
          <Route path=":id" element={<MaintenanceDetailPage />} />
        </Route>

        {/* ── Fuel Logs ───────────────────────────────── */}
        <Route path="/fuel">
          <Route index element={<FuelLogsListPage />} />
          <Route path="new" element={<FuelLogFormPage />} />
        </Route>

        {/* ── Expenses ────────────────────────────────── */}
        <Route path="/expenses">
          <Route index element={<ExpensesListPage />} />
          <Route path="new" element={<ExpenseFormPage />} />
        </Route>

        {/* ── Reports ─────────────────────────────────── */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* ── Settings ────────────────────────────────── */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* ─────────────────────────────────────────────────
          CATCH-ALL — 404
          ───────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
