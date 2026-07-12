import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE, toneClasses } from "@/lib/statusTone";
import {
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_LABELS,
} from "@/constants/maintenanceStatus";

const TONES = {
  [MAINTENANCE_STATUS.OPEN]: TONE.WARNING,
  [MAINTENANCE_STATUS.CLOSED]: TONE.SUCCESS,
};

const MaintenanceStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(toneClasses(TONES[status]), className)}>
    {MAINTENANCE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default MaintenanceStatusBadge;
