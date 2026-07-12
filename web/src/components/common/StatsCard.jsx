import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * StatsCard
 *
 * A reusable enterprise metric card for dashboards and summary sections.
 *
 * Props
 * ─────
 * @param {React.ElementType} icon        - Required. A Lucide (or any) icon component.
 * @param {string}            title       - Required. Metric label (e.g. "Total Vehicles").
 * @param {string|number}     value       - Required. The primary metric value (e.g. "128", "$4,200").
 * @param {object}            [trend]     - Optional trend indicator.
 *   @param {number}          trend.value     - Numeric delta (positive = up, negative = down, 0 = flat).
 *   @param {string}          [trend.label]   - Descriptive suffix (e.g. "vs last month").
 *   @param {"up"|"down"|"flat"} [trend.direction] - Override auto-derived direction.
 * @param {string}            [footer]    - Optional footer text (e.g. "Updated just now").
 * @param {React.ReactNode}   [footerNode]  - Optional footer as arbitrary JSX (overrides `footer`).
 * @param {function}          [onClick]   - When provided, makes the card interactive.
 * @param {string}            [className] - Extra classes on the Card root.
 *
 * Usage
 * ─────
 * // Minimal
 * <StatsCard icon={Truck} title="Total Vehicles" value={48} />
 *
 * // With trend and footer
 * <StatsCard
 *   icon={Route}
 *   title="Trips This Month"
 *   value="312"
 *   trend={{ value: 14, label: "vs last month" }}
 *   footer="Last updated just now"
 * />
 *
 * // Negative trend
 * <StatsCard
 *   icon={Fuel}
 *   title="Fuel Cost"
 *   value="$8,420"
 *   trend={{ value: -6, label: "vs last month" }}
 * />
 *
 * // Flat / no change
 * <StatsCard
 *   icon={Users}
 *   title="Active Drivers"
 *   value={24}
 *   trend={{ value: 0, label: "no change" }}
 * />
 */

// ── Trend helpers ────────────────────────────────────────────────────────────

function derivedDirection(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

const TREND_CONFIG = {
  up: {
    Icon: TrendingUp,
    // Monochrome: slightly darker text for up (positive)
    className: "text-foreground",
    prefix: "+",
  },
  down: {
    Icon: TrendingDown,
    // Muted for down (negative)
    className: "text-muted-foreground",
    prefix: "",
  },
  flat: {
    Icon: Minus,
    className: "text-muted-foreground/70",
    prefix: "",
  },
};

function TrendIndicator({ trend }) {
  if (!trend) return null;

  const direction = trend.direction ?? derivedDirection(trend.value);
  const { Icon, className, prefix } = TREND_CONFIG[direction];
  const display =
    trend.value === 0
      ? "No change"
      : `${prefix}${Math.abs(trend.value)}%`;

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", className)}>
      <Icon size={13} aria-hidden="true" className="shrink-0" />
      <span>{display}</span>
      {trend.label && (
        <span className="font-normal text-muted-foreground">{trend.label}</span>
      )}
    </div>
  );
}

// ── StatsCard ────────────────────────────────────────────────────────────────

export default function StatsCard({
  icon: Icon,
  title,
  value,
  trend,
  footer,
  footerNode,
  onClick,
  className,
}) {
  const isInteractive = Boolean(onClick);

  return (
    <Card
      className={cn(
        "gap-3 transition-shadow duration-150",
        isInteractive &&
          "cursor-pointer hover:ring-foreground/20 hover:shadow-sm active:scale-[0.99]",
        className
      )}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick()
          : undefined
      }
    >
      <CardContent className="flex flex-col gap-3">
        {/* ── Top row: icon + title ──────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          {/* Icon container — monochrome filled square */}
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground/5"
          >
            <Icon
              size={16}
              className="text-foreground/70"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Value ────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>

          {/* Trend */}
          <TrendIndicator trend={trend} />
        </div>
      </CardContent>

      {/* ── Footer ───────────────────────────────────────
          Only rendered when footer text or footerNode is passed.
          Uses CardFooter which adds the bg-muted/50 strip + top border.
      ──────────────────────────────────────────────────── */}
      {(footer || footerNode) && (
        <CardFooter className="py-2.5">
          {footerNode ?? (
            <p className="text-xs text-muted-foreground">{footer}</p>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
