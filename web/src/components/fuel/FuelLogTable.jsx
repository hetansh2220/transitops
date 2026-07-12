import { Link } from "react-router-dom";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
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

const number = (value) => Number(value ?? 0).toLocaleString();

const FuelLogTable = ({ logs, canWrite, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[80px]">ID</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Assigned Trip</TableHead>
        <TableHead className="text-right">Volume (Liters)</TableHead>
        <TableHead className="text-right">Total Cost</TableHead>
        <TableHead className="text-right">Price per Liter</TableHead>
        <TableHead>Refuel Date</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {logs.map((log) => {
        const pRate = log.liters > 0 ? log.cost / log.liters : 0;
        return (
          <TableRow key={log.id}>
            <TableCell className="font-mono text-xs">#{log.id}</TableCell>
            <TableCell className="font-medium">
              {log.vehicleRegistration ?? `ID: ${log.vehicleId}`}
            </TableCell>
            <TableCell>
              {log.tripId ? (
                <Link
                  to={`/trips/${log.tripId}`}
                  className="text-primary hover:underline font-medium"
                >
                  {log.tripSource && log.tripDestination
                    ? `${log.tripSource} → ${log.tripDestination}`
                    : `Trip #${log.tripId}`}
                </Link>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {number(log.liters)} L
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              ${number(log.cost)}
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums text-muted-foreground text-xs">
              ${pRate.toFixed(2)}/L
            </TableCell>
            <TableCell className="font-numeric tabular-nums">
              {log.date ? new Date(log.date).toLocaleDateString() : "—"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for fuel log #${log.id}`}>
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canWrite ? (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(log)} className="gap-2">
                        <Edit2 size={14} aria-hidden="true" />
                        Edit log
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(log)}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete log
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled>No actions allowed</DropdownMenuItem>
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

export default FuelLogTable;
