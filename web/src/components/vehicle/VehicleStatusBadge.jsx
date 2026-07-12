import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE, toneClasses } from "@/lib/statusTone";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS } from "@/constants/vehicleStatus";

const TONES = {
  [VEHICLE_STATUS.AVAILABLE]: TONE.SUCCESS,
  [VEHICLE_STATUS.ON_TRIP]: TONE.INFO,
  [VEHICLE_STATUS.IN_SHOP]: TONE.WARNING,
  [VEHICLE_STATUS.RETIRED]: TONE.NEUTRAL,
};

const VehicleStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(toneClasses(TONES[status]), className)}>
    {VEHICLE_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default VehicleStatusBadge;
