import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TripStatusBadge from "@/components/trip/TripStatusBadge";
import { listTrips } from "@/api/trips";

const RECENT_LIMIT = 6;

const RecentTrips = () => {
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    // The API already returns newest first and joins vehicle/driver names.
    queryFn: () => listTrips(),
  });

  const recent = trips.slice(0, RECENT_LIMIT);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Recent trips</h2>
        <Link
          to="/trips"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No trips recorded yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">
                  <Link to={`/trips/${trip.id}`} className="hover:underline">
                    {trip.source} → {trip.destination}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {trip.vehicleRegistration ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {trip.driverName ?? "—"}
                </TableCell>
                <TableCell>
                  <TripStatusBadge status={trip.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default RecentTrips;
