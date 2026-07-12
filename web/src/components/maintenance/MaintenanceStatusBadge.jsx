import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_LABELS,
} from "@/constants/maintenanceStatus";

const STYLES = {
  [MAINTENANCE_STATUS.OPEN]:
    "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  [MAINTENANCE_STATUS.CLOSED]:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const MaintenanceStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(STYLES[status], className)}>
    {MAINTENANCE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default MaintenanceStatusBadge;
