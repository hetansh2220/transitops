import { currency } from "@/lib/format";
import { Eye, MoreHorizontal, Play, CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/common/StatusBadge";

const number = (value) => Number(value ?? 0).toLocaleString();

const TripTable = ({
  trips,
  canWrite,
  onView,
  onEdit,
  onDelete,
  onDispatch,
  onComplete,
  onCancel,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[80px]">ID</TableHead>
        <TableHead>Route</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Driver</TableHead>
        <TableHead className="text-right">Cargo Weight</TableHead>
        <TableHead className="text-right">Revenue</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {trips.map((trip) => {
        const isDraft = trip.status === "draft";
        const isDispatched = trip.status === "dispatched";
        const isEditableOrDeletable = isDraft || trip.status === "cancelled";

        return (
          <TableRow key={trip.id}>
            <TableCell className="font-mono text-xs">#{trip.id}</TableCell>
            <TableCell>
              <div className="font-medium">
                {trip.source} → {trip.destination}
              </div>
              <div className="text-xs text-muted-foreground">
                {trip.plannedDistance ? `${number(trip.plannedDistance)} km planned` : "—"}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium">{trip.vehicleRegistration}</span>
              {trip.vehicleName && (
                <span className="block text-xs text-muted-foreground">
                  {trip.vehicleName}
                </span>
              )}
            </TableCell>
            <TableCell>
              <span className="font-medium">{trip.driverName}</span>
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {number(trip.cargoWeight)} kg
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {trip.revenue ? currency(trip.revenue) : "—"}
            </TableCell>
            <TableCell>
              <StatusBadge status={trip.status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for trip #${trip.id}`}>
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(trip)} className="gap-2">
                    <Eye size={14} aria-hidden="true" />
                    View details
                  </DropdownMenuItem>

                  {canWrite && (
                    <>
                      {isDraft && (
                        <DropdownMenuItem
                          onClick={() => onDispatch(trip)}
                          className="gap-2 text-primary"
                        >
                          <Play size={14} aria-hidden="true" />
                          Dispatch trip
                        </DropdownMenuItem>
                      )}

                      {isEditableOrDeletable && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onEdit(trip)}
                            className="gap-2"
                          >
                            <Edit2 size={14} aria-hidden="true" />
                            Edit trip
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(trip)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete trip
                          </DropdownMenuItem>
                        </>
                      )}

                      {isDispatched && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onComplete(trip)}
                            className="gap-2 text-primary"
                          >
                            <CheckCircle size={14} aria-hidden="true" />
                            Complete trip
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onCancel(trip)}
                            className="gap-2 text-destructive"
                          >
                            <XCircle size={14} aria-hidden="true" />
                            Cancel trip
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export default TripTable;
