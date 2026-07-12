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
 * Each item: { label, href, icon }
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
      },
      {
        label: "Drivers",
        href: "/drivers",
        icon: Users,
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
      },
      {
        label: "Maintenance",
        href: "/maintenance",
        icon: Wrench,
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
      },
      {
        label: "Expenses",
        href: "/expenses",
        icon: Receipt,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
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
