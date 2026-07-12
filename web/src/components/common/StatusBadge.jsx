import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, STATUS_FALLBACK } from "@/constants/statusConfig";

/**
 * StatusBadge
 *
 * Renders a monochrome status pill for any TransitOps entity status.
 * Automatically looks up label and visual style from statusConfig.js —
 * no per-callsite styling needed.
 *
 * Props
 * ─────
 * @param {string}  status      - The raw backend status string (e.g. "on_trip", "dispatched").
 * @param {boolean} [showDot]   - When true (default), renders a leading status dot.
 * @param {string}  [size]      - "sm" | "default" | "lg". Controls font/padding scale.
 * @param {string}  [className] - Extra classes merged onto the Badge root.
 *
 * Usage
 * ─────
 * <StatusBadge status="available" />
 * <StatusBadge status="on_trip" showDot={false} />
 * <StatusBadge status="completed" size="lg" />
 * <StatusBadge status={vehicle.status} />
 */

// Size scale overrides applied on top of the badge base classes
const SIZE_CLASSES = {
  sm: "h-4 px-1.5 text-[10px] gap-0.5",
  default: "h-5 px-2 text-xs gap-1",
  lg: "h-6 px-2.5 text-[13px] gap-1.5",
};

const DOT_SIZE_CLASSES = {
  sm: "size-1",
  default: "size-1.5",
  lg: "size-2",
};

export default function StatusBadge({
  status,
  showDot = true,
  size = "default",
  className,
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_FALLBACK;

  // Use the configured label, or format the raw value as a fallback
  const label =
    config.label ??
    status
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Unknown";

  return (
    <Badge
      // Don't pass a variant — we drive everything via className
      variant={undefined}
      className={cn(
        // Reset badge defaults that conflict with our custom classes
        "rounded-full border font-medium",
        // Size
        SIZE_CLASSES[size] ?? SIZE_CLASSES.default,
        // Status-specific colours from config
        config.className,
        className
      )}
    >
      {/* Pulsing dot for active/in-progress states, static for others */}
      {showDot && (
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 rounded-full",
            DOT_SIZE_CLASSES[size] ?? DOT_SIZE_CLASSES.default,
            config.dotClassName,
            // Subtle pulse animation for actively-running states
            (status === "on_trip" || status === "dispatched") &&
              "animate-pulse"
          )}
        />
      )}
      {label}
    </Badge>
  );
}
