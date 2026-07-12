import { Eye, MoreHorizontal, Pencil, PowerOff, RotateCcw } from "lucide-react";
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
import VehicleStatusBadge from "@/components/vehicle/VehicleStatusBadge";
import { VEHICLE_STATUS } from "@/constants/vehicleStatus";

const number = (value) => Number(value ?? 0).toLocaleString();

const VehicleTable = ({ vehicles, canWrite, onView, onEdit, onChangeStatus }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Registration</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Region</TableHead>
        <TableHead className="text-right">Capacity (kg)</TableHead>
        <TableHead className="text-right">Odometer (km)</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {vehicles.map((vehicle) => {
        const isRetired = vehicle.status === VEHICLE_STATUS.RETIRED;

        return (
          <TableRow key={vehicle.id}>
            <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
            <TableCell>
              <span className="font-medium">{vehicle.name}</span>
              {vehicle.model && (
                <span className="block text-xs text-muted-foreground">{vehicle.model}</span>
              )}
            </TableCell>
            <TableCell>{vehicle.type}</TableCell>
            <TableCell className="text-muted-foreground">{vehicle.region ?? "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {number(vehicle.maxLoadCapacity)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {number(vehicle.odometer)}
            </TableCell>
            <TableCell>
              <VehicleStatusBadge status={vehicle.status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${vehicle.registrationNumber}`}>
                    <MoreHorizontal size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(vehicle)} className="gap-2">
                    <Eye size={14} aria-hidden="true" />
                    View details
                  </DropdownMenuItem>

                  {canWrite && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(vehicle)} className="gap-2">
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>

                      {/* The API exposes no delete — retiring is the way a vehicle leaves the fleet. */}
                      {isRetired ? (
                        <DropdownMenuItem
                          onClick={() => onChangeStatus(vehicle, VEHICLE_STATUS.AVAILABLE)}
                          className="gap-2"
                        >
                          <RotateCcw size={14} aria-hidden="true" />
                          Return to service
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onChangeStatus(vehicle, VEHICLE_STATUS.RETIRED)}
                          className="gap-2"
                        >
                          <PowerOff size={14} aria-hidden="true" />
                          Retire
                        </DropdownMenuItem>
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

export default VehicleTable;
