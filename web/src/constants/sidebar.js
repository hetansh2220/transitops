import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";

/**
 * Sidebar navigation structure.
 * Each group has a label and an array of nav items.
 * Each item: { label, href, icon, resource? }
 *
 * `resource` keys into VIEW_ROLES in lib/permissions.js — the item is hidden
 * from roles that aren't listed there. An item with no resource (Dashboard,
 * Settings) is visible to everyone.
 */
export const NAV_GROUPS = [
  {
    label: "Fleet",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Vehicles",
        href: "/vehicles",
        icon: Truck,
        resource: "vehicles",
      },
      {
        label: "Drivers",
        href: "/drivers",
        icon: Users,
        resource: "drivers",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Trips",
        href: "/trips",
        icon: Route,
        resource: "trips",
      },
      {
        label: "Maintenance",
        href: "/maintenance",
        icon: Wrench,
        resource: "maintenance",
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Fuel Logs",
        href: "/fuel",
        icon: Fuel,
        resource: "fuelLogs",
      },
      {
        label: "Expenses",
        href: "/expenses",
        icon: Receipt,
        resource: "expenses",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        resource: "reports",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];
