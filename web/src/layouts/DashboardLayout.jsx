import { Outlet } from "react-router-dom";

/**
 * DashboardLayout
 * Wraps all authenticated app pages (Dashboard, Vehicles, Drivers, etc.).
 * Will hold the Sidebar + Navbar + main content area.
 * Sidebar and Navbar components from components/layout/ are wired in here
 * once they are implemented.
 */
const DashboardLayout = () => {
  return (
    <div id="dashboard-layout">
      {/* Sidebar placeholder */}
      <aside id="sidebar" />

      <div id="main-content">
        {/* Navbar placeholder */}
        <header id="navbar" />

        <main id="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
