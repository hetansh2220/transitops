import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE, toneClasses } from "@/lib/statusTone";
import { TRIP_STATUS, TRIP_STATUS_LABELS } from "@/constants/tripStatus";

const TONES = {
  [TRIP_STATUS.DRAFT]: TONE.NEUTRAL,
  [TRIP_STATUS.DISPATCHED]: TONE.INFO,
  [TRIP_STATUS.COMPLETED]: TONE.SUCCESS,
  [TRIP_STATUS.CANCELLED]: TONE.DANGER,
};

const TripStatusBadge = ({ status, className }) => (
  <Badge variant="outline" className={cn(toneClasses(TONES[status]), className)}>
    {TRIP_STATUS_LABELS[status] ?? status}
  </Badge>
);

export default TripStatusBadge;
