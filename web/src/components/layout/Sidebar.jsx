import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavGroups } from "@/hooks/useNavGroups";

// ─── Shared nav item used by both desktop and mobile ───────────────────────

export function NavItem({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      end={item.href === "/dashboard"}
      className={({ isActive }) =>
        cn(
          // Base styles
          "group relative flex items-center gap-3 rounded-md px-3 py-2.5",
          "text-sm font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
          // Inactive
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          // Active
          isActive &&
            "bg-foreground text-background hover:bg-foreground hover:text-background",
          // Collapsed centering
          collapsed && "justify-center px-2"
        )
      }
    >
      <Icon
        size={18}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-150"
      />

      {/* Label — hidden when collapsed, shown with fade */}
      <span
        className={cn(
          "truncate transition-all duration-200",
          collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
        )}
      >
        {item.label}
      </span>

      {/* Tooltip shown only when collapsed */}
      {collapsed && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-full ml-2 z-50",
            "whitespace-nowrap rounded-md border border-border bg-popover",
            "px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md",
            "opacity-0 translate-x-1 transition-all duration-150",
            "group-hover:opacity-100 group-hover:translate-x-0",
            "group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
          )}
        >
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

// ─── Nav group section ──────────────────────────────────────────────────────

function NavGroup({ group, collapsed }) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Group label — hidden when collapsed */}
      <p
        aria-hidden={collapsed}
        className={cn(
          "mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-all duration-200 select-none",
          collapsed ? "h-0 overflow-hidden opacity-0 mb-0" : "h-auto opacity-100"
        )}
      >
        {group.label}
      </p>

      {group.items.map((item) => (
        <NavItem key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

// ─── Desktop Sidebar ────────────────────────────────────────────────────────

const SIDEBAR_W_EXPANDED = "w-60";
const SIDEBAR_W_COLLAPSED = "w-[60px]";

export default function Sidebar({ collapsed, onToggle }) {
  const navGroups = useNavGroups();

  return (
    <aside
      id="sidebar"
      aria-label="Main navigation"
      className={cn(
        // Layout
        "relative hidden md:flex flex-col h-screen shrink-0",
        "border-r border-border bg-sidebar",
        // Smooth width transition
        "transition-[width] duration-300 ease-in-out overflow-hidden",
        collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED
      )}
    >
      {/* ── Logo / Brand ─────────────────────────────── */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-3 shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        {/* Logo mark — always visible */}
        <div
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground"
        >
          <span className="text-[11px] font-black tracking-tight text-background">
            TO
          </span>
        </div>

        {/* Wordmark — hidden when collapsed */}
        <span
          className={cn(
            "font-heading text-sm font-bold tracking-tight text-foreground transition-all duration-200 whitespace-nowrap overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          TransitOps
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-5"
        aria-label="Sidebar navigation"
      >
        {navGroups.map((group) => (
          <NavGroup key={group.label} group={group} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Collapse Toggle ──────────────────────────── */}
      <div className="shrink-0 border-t border-border p-2">
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="sidebar"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5",
            "text-sm font-medium text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} aria-hidden="true" className="shrink-0" />
          ) : (
            <>
              <PanelLeftClose size={18} aria-hidden="true" className="shrink-0" />
              <span className="truncate transition-all duration-200">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
