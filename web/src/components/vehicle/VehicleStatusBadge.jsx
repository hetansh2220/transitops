import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from "@/constants/vehicleStatus";

const STYLES = {
  [VEHICLE_STATUS.AVAILABLE]:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [VEHICLE_STATUS.ON_TRIP]:
    "border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  [VEHICLE_STATUS.IN_SHOP]:
    "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  [VEHICLE_STATUS.RETIRED]:
    "border-muted-foreground/30 bg-muted text-muted-foreground",
};

const VehicleStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(STYLES[status], className)}>
    {VEHICLE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default VehicleStatusBadge;
