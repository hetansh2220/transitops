import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE, toneClasses } from "@/lib/statusTone";
import { DRIVER_STATUS, DRIVER_STATUS_LABELS } from "@/constants/driverStatus";

const TONES = {
  [DRIVER_STATUS.AVAILABLE]: TONE.SUCCESS,
  [DRIVER_STATUS.ON_TRIP]: TONE.INFO,
  [DRIVER_STATUS.OFF_DUTY]: TONE.NEUTRAL,
  [DRIVER_STATUS.SUSPENDED]: TONE.DANGER,
};

const DriverStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(toneClasses(TONES[status]), className)}>
    {DRIVER_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default DriverStatusBadge;
