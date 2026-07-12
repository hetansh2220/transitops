import { useLocation, Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/constants/sidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import UserDropdown from "@/components/layout/UserDropdown";
import MobileSidebar from "@/components/layout/MobileSidebar";

// ── Route metadata lookup ─────────────────────────────────────────────────
// Flatten all nav items into a path → label map for breadcrumb resolution.
const ROUTE_LABELS = NAV_GROUPS.flatMap((g) => g.items).reduce(
  (acc, item) => ({ ...acc, [item.href]: item.label }),
  {}
);

// Extra labels for sub-routes not in the sidebar config
const EXTRA_LABELS = {
  new: "New",
  edit: "Edit",
};

/**
 * Derive a human-readable label for a single path segment.
 * e.g. "/vehicles"  → "Vehicles"
 *      "new"        → "New"
 *      "42"         → "Details" (numeric ID)
 */
function segmentLabel(segment, fullPath) {
  if (!segment) return null;
  if (ROUTE_LABELS[fullPath]) return ROUTE_LABELS[fullPath];
  if (EXTRA_LABELS[segment]) return EXTRA_LABELS[segment];
  // Numeric segment = detail page
  if (/^\d+$/.test(segment)) return "Details";
  // Capitalise fallback
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Build an array of breadcrumb items from the current pathname.
 * e.g. /vehicles/42/edit  →  [Dashboard, Vehicles, Details, Edit]
 */
function useBreadcrumbs() {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Dashboard", href: "/dashboard" }];

  let accumulated = "";
  for (const seg of segments) {
    accumulated += `/${seg}`;
    const label = segmentLabel(seg, accumulated);
    if (label && label !== "Dashboard") {
      crumbs.push({ label, href: accumulated });
    }
  }

  // Deduplicate consecutive identical labels
  return crumbs.filter(
    (crumb, i, arr) => i === 0 || crumb.label !== arr[i - 1].label
  );
}

// ── Search bar ─────────────────────────────────────────────────────────────
function GlobalSearch() {
  return (
    <div className="relative flex-1 max-w-xs hidden sm:flex items-center">
      <Search
        size={14}
        aria-hidden="true"
        className="absolute left-2.5 text-muted-foreground pointer-events-none"
      />
      <input
        id="global-search"
        type="search"
        placeholder="Search…"
        aria-label="Global search"
        className={cn(
          "h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1",
          "hover:border-foreground/30"
        )}
      />
      {/* Keyboard shortcut hint */}
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground sm:flex"
      >
        ⌘K
      </kbd>
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────
function Breadcrumb({ crumbs }) {
  const isLast = (i) => i === crumbs.length - 1;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex min-w-0">
      <ol className="flex items-center gap-1 text-sm" role="list">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight
                size={13}
                aria-hidden="true"
                className="shrink-0 text-muted-foreground/50"
              />
            )}
            {isLast(i) ? (
              <span
                aria-current="page"
                className="truncate font-semibold text-foreground"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className={cn(
                  "truncate text-muted-foreground",
                  "hover:text-foreground transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:underline"
                )}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ── Page title (mobile only) ───────────────────────────────────────────────
function MobilePageTitle({ crumbs }) {
  const current = crumbs[crumbs.length - 1];
  return (
    <span className="md:hidden font-heading text-sm font-bold tracking-tight text-foreground truncate">
      {current?.label ?? "TransitOps"}
    </span>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────
export default function Navbar({ mobileOpen, onMobileOpenChange }) {
  const crumbs = useBreadcrumbs();

  return (
    <header
      id="navbar"
      className={cn(
        "flex h-14 shrink-0 items-center gap-3",
        "border-b border-border px-4",
        "transition-colors duration-150"
      )}
    >
      {/* ── Left section ─────────────────────────────── */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile hamburger */}
        <MobileSidebar open={mobileOpen} onOpenChange={onMobileOpenChange} />

        {/* Breadcrumb (desktop) / Page title (mobile) */}
        <Breadcrumb crumbs={crumbs} />
        <MobilePageTitle crumbs={crumbs} />
      </div>

      {/* ── Right section ────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2">
        <GlobalSearch />

        {/* Divider */}
        <div
          aria-hidden="true"
          className="hidden sm:block h-5 w-px bg-border"
        />

        <NotificationBell />

        {/* Divider */}
        <div aria-hidden="true" className="h-5 w-px bg-border" />

        <UserDropdown />
      </div>
    </header>
  );
}
