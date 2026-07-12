import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TRIP_STATUS, TRIP_STATUS_LABELS } from "@/constants/tripStatus";

const STYLES = {
  [TRIP_STATUS.DRAFT]: "border-muted-foreground/30 bg-muted text-muted-foreground",
  [TRIP_STATUS.DISPATCHED]:
    "border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  [TRIP_STATUS.COMPLETED]:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  [TRIP_STATUS.CANCELLED]:
    "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const TripStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(STYLES[status], className)}>
    {TRIP_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default TripStatusBadge;
