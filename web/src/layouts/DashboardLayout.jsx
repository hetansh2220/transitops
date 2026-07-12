import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

/**
 * DashboardLayout
 *
 * Shell architecture:
 *
 *  ┌──────────────────────────────────────────────────────┐  h-full (viewport)
 *  │  ┌──────────────┐  ┌───────────────────────────────┐ │  flex-row
 *  │  │              │  │  ┌─────────────────────────┐   │ │
 *  │  │   Sidebar    │  │  │  Navbar (sticky top-0)  │   │ │  h-14, shrink-0
 *  │  │  (fixed col) │  │  └─────────────────────────┘   │ │
 *  │  │              │  │  ┌─────────────────────────┐   │ │
 *  │  │              │  │  │                         │   │ │
 *  │  │              │  │  │   <Outlet />            │   │ │  flex-1, scroll
 *  │  │              │  │  │                         │   │ │
 *  │  └──────────────┘  │  └─────────────────────────┘   │ │
 *  │                    └───────────────────────────────┘ │
 *  └──────────────────────────────────────────────────────┘
 *
 * Key decisions:
 *  - The root `div` is `h-full` + `overflow-hidden` → locks the viewport.
 *  - Sidebar is a `flex-col h-full shrink-0` column — it never scrolls itself.
 *  - Right column is `flex-col min-w-0 flex-1 overflow-hidden`.
 *  - Navbar is `shrink-0` inside the right column — always at the top.
 *  - `<main>` is `flex-1 overflow-y-auto` — the ONLY scrollable region.
 *  - Sidebar width transition is `transition-[width]` — the right column
 *    automatically fills the remaining space via `flex-1`, creating a smooth
 *    push effect without any JS measuring.
 */

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    []
  );

  const handleMobileOpen = useCallback((val) => setMobileOpen(val), []);

  return (
    <div
      id="app-shell"
      className="flex h-full w-full overflow-hidden bg-background"
    >
      {/* ── Desktop Sidebar ───────────────────────────────────────────────
          hidden on mobile (md:flex), fixed-width column on desktop.
          Width transitions smoothly between w-60 and w-[60px].
          The sidebar is NOT position:fixed — it lives in normal flow so
          the right column expands/contracts automatically via flex.
      ─────────────────────────────────────────────────────────────────── */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      {/* ── Right column — Navbar + scrollable content ───────────────────
          min-w-0 is critical: prevents flex children from overflowing
          when content is wider than available space.
      ─────────────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Sticky Navbar ─────────────────────────────────────────────
            sticky + top-0 + z-20 pins the bar to the top of THIS
            column (not the viewport), so it sticks correctly even
            when the sidebar is wider than the screen on small desktops.
            bg-background/95 + backdrop-blur gives a frosted-glass feel
            as content scrolls underneath.
        ───────────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "sticky top-0 z-20 shrink-0",
            "bg-background/95 backdrop-blur-sm"
          )}
        >
          <Navbar
            mobileOpen={mobileOpen}
            onMobileOpenChange={handleMobileOpen}
          />
        </div>

        {/* ── Scrollable page content ────────────────────────────────────
            flex-1 makes this fill all remaining vertical space.
            overflow-y-auto makes ONLY this region scroll — the
            sidebar and navbar remain stationary.
            The padding uses a responsive scale:
              mobile:  px-4 py-5
              sm+:     px-6 py-6
              lg+:     px-8 py-8
            This gives breathing room at every breakpoint without
            making content feel cramped on smaller screens.
        ───────────────────────────────────────────────────────────────── */}
        <main
          id="page-content"
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
          )}
        >
          {/* Max-width container centres content on very wide screens */}
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
