import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, ChevronRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/constants/sidebar";
import NotificationBell from "@/components/layout/NotificationBell";
import UserDropdown from "@/components/layout/UserDropdown";
import MobileSidebar from "@/components/layout/MobileSidebar";
import CommandPalette from "@/components/layout/CommandPalette";

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

// ── Search trigger ─────────────────────────────────────────────────────────
// A button, not a text input: typing happens inside the ⌘K palette. A real
// field here would be a decoy that swallows keystrokes and does nothing.
function GlobalSearch({ onOpen }) {
  return (
    <button
      id="global-search"
      type="button"
      onClick={onOpen}
      aria-label="Search"
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "relative flex-1 max-w-xs hidden sm:flex items-center",
        "h-8 rounded-md border border-input bg-transparent pl-8 pr-3",
        "text-sm text-muted-foreground transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1",
        "hover:border-foreground/30 hover:text-foreground"
      )}
    >
      <Search
        size={14}
        aria-hidden="true"
        className="absolute left-2.5 pointer-events-none"
      />
      <span>Search…</span>

      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border border-border px-1.5 font-mono text-[10px] sm:flex"
      >
        ⌘K
      </kbd>
    </button>
  );
}

// ── Theme toggle ───────────────────────────────────────────────────────────
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // resolvedTheme is undefined until hydration; wait so the icon doesn't flip.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md",
        "text-muted-foreground transition-colors duration-150",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
      )}
    >
      {mounted && isDark ? (
        <Sun size={17} aria-hidden="true" />
      ) : (
        <Moon size={17} aria-hidden="true" />
      )}
    </button>
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
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl-K opens the palette from anywhere in the app.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
        <GlobalSearch onOpen={() => setPaletteOpen(true)} />

        {/* Divider */}
        <div
          aria-hidden="true"
          className="hidden sm:block h-5 w-px bg-border"
        />

        <ThemeToggle />
        <NotificationBell />

        {/* Divider */}
        <div aria-hidden="true" className="h-5 w-px bg-border" />

        <UserDropdown />
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
