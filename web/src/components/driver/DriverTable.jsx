import { AlertTriangle, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import DriverStatusBadge from "@/components/driver/DriverStatusBadge";
import {
  DRIVER_STATUS,
  DRIVER_STATUS_LABELS,
  MANUAL_DRIVER_STATUSES,
  isLicenseExpired,
} from "@/constants/driverStatus";

const DriverTable = ({
  drivers,
  tripCounts,
  canWrite,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Driver</TableHead>
        <TableHead>Licence no.</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Expiry</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead className="text-right">Trips</TableHead>
        <TableHead className="text-right">Safety</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {drivers.map((driver) => {
        const expired = isLicenseExpired(driver);
        // The API rejects any status change while a driver is mid-trip.
        const onTrip = driver.status === DRIVER_STATUS.ON_TRIP;

        return (
          <TableRow key={driver.id}>
            <TableCell className="font-medium">{driver.name}</TableCell>
            <TableCell className="font-numeric tabular-nums">{driver.licenseNumber}</TableCell>
            <TableCell>{driver.licenseCategory}</TableCell>
            <TableCell>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-numeric tabular-nums",
                  expired && "font-medium text-destructive",
                )}
              >
                {expired && <AlertTriangle size={13} aria-hidden="true" />}
                {driver.licenseExpiryDate}
                {expired && <span className="sr-only">(expired)</span>}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {driver.contactNumber ?? "—"}
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {tripCounts[driver.id] ?? 0}
            </TableCell>
            <TableCell className="text-right font-numeric tabular-nums">
              {Number(driver.safetyScore).toFixed(0)}
            </TableCell>
            <TableCell>
              <DriverStatusBadge status={driver.status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${driver.name}`}
                  >
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(driver)} className="gap-2">
                    <Eye size={14} aria-hidden="true" />
                    View details
                  </DropdownMenuItem>

                  {canWrite && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(driver)} className="gap-2">
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {onTrip ? "On trip — status locked" : "Set status"}
                      </DropdownMenuLabel>

                      {MANUAL_DRIVER_STATUSES.filter(
                        (value) => value !== driver.status,
                      ).map((value) => (
                        <DropdownMenuItem
                          key={value}
                          disabled={onTrip}
                          onClick={() => onChangeStatus(driver, value)}
                        >
                          {DRIVER_STATUS_LABELS[value]}
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={onTrip}
                        onClick={() => onDelete(driver)}
                        className="gap-2"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </DropdownMenuItem>
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

export default DriverTable;
