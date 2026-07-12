import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PageHeader
 *
 * A reusable enterprise-grade page header for all module pages.
 *
 * Props
 * ─────
 * @param {string}   title          - Required. The page/section title (rendered as h1).
 * @param {string}   [description]  - Optional subtitle shown below the title.
 * @param {Array}    [breadcrumbs]  - Optional array of { label, href? } items.
 *                                   The last item is always rendered as plain text
 *                                   (aria-current="page"). Earlier items are links.
 * @param {ReactNode} [action]      - Optional slot for a primary action element
 *                                   (e.g. a <Button> or a group of buttons).
 *                                   Rendered right-aligned on desktop, stacked below
 *                                   the title block on mobile.
 * @param {string}   [className]    - Extra classes applied to the outer wrapper.
 * @param {boolean}  [withSeparator] - When true (default), renders a bottom border
 *                                    separator below the header. Pass false to omit
 *                                    it (e.g. when the next element already has a
 *                                    top border).
 *
 * Usage
 * ─────
 * // Minimal
 * <PageHeader title="Vehicles" />
 *
 * // With description and a create button
 * <PageHeader
 *   title="Vehicles"
 *   description="Manage your fleet registrations and availability."
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Vehicles" },
 *   ]}
 *   action={
 *     <Button size="sm">
 *       <PlusIcon /> Add Vehicle
 *     </Button>
 *   }
 * />
 */

// ── Breadcrumb sub-component ────────────────────────────────────────────────

function PageBreadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" role="list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  size={11}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground/40"
                />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "transition-colors duration-150",
                    "hover:text-foreground",
                    "focus-visible:outline-none focus-visible:underline"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── PageHeader ──────────────────────────────────────────────────────────────

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className,
  withSeparator = true,
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Breadcrumb row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <PageBreadcrumb items={breadcrumbs} />
      )}

      {/* Title row — stacks vertically on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: title + description */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Right: action slot — full-width on mobile, auto-width on sm+ */}
        {action && (
          <div className="flex shrink-0 items-center gap-2 sm:mt-0.5">
            {action}
          </div>
        )}
      </div>

      {/* Bottom separator */}
      {withSeparator && (
        <Separator className="mt-1" />
      )}
    </div>
  );
}
