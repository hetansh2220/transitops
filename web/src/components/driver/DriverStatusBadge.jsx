import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DRIVER_STATUS, DRIVER_STATUS_LABELS } from "@/constants/driverStatus";

const STYLES = {
  [DRIVER_STATUS.AVAILABLE]:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [DRIVER_STATUS.ON_TRIP]:
    "border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  [DRIVER_STATUS.OFF_DUTY]: "border-muted-foreground/30 bg-muted text-muted-foreground",
  [DRIVER_STATUS.SUSPENDED]:
    "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const DriverStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(STYLES[status], className)}>
    {DRIVER_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default DriverStatusBadge;
