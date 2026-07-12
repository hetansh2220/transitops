import { CheckCircle2, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
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
import MaintenanceStatusBadge from "@/components/maintenance/MaintenanceStatusBadge";
import { MAINTENANCE_STATUS } from "@/constants/maintenanceStatus";

const currency = (value) => Number(value ?? 0).toLocaleString();

const MaintenanceTable = ({ logs, canWrite, onSetStatus, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Vehicle</TableHead>
        <TableHead>Service</TableHead>
        <TableHead className="text-right">Cost</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {logs.map((log) => {
        const isOpen = log.status === MAINTENANCE_STATUS.OPEN;

        return (
          <TableRow key={log.id}>
            <TableCell className="font-medium">
              {log.vehicleRegistration ?? "—"}
              {log.vehicleName && (
                <span className="block text-xs text-muted-foreground">
                  {log.vehicleName}
                </span>
              )}
            </TableCell>
            <TableCell>{log.serviceType}</TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {currency(log.cost)}
            </TableCell>
            <TableCell className="text-muted-foreground font-numeric tabular-nums">
              {log.date}
            </TableCell>
            <TableCell>
              <MaintenanceStatusBadge status={log.status} />
            </TableCell>
            <TableCell>
              {canWrite && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${log.serviceType}`}
                    >
                      <MoreHorizontal size={16} aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Closing a log returns the vehicle to service — that's the
                        mandatory transition, so it's the primary action here. */}
                    {isOpen ? (
                      <DropdownMenuItem
                        onClick={() => onSetStatus(log, MAINTENANCE_STATUS.CLOSED)}
                        className="gap-2"
                      >
                        <CheckCircle2 size={14} aria-hidden="true" />
                        Close &amp; return to service
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onSetStatus(log, MAINTENANCE_STATUS.OPEN)}
                        className="gap-2"
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        Re-open (sends to shop)
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(log)}
                      className="gap-2"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

export default MaintenanceTable;
