import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Truck, Users, Route as RouteIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useNavGroups } from "@/hooks/useNavGroups";
import { useAuth } from "@/context/AuthContext";
import { canView } from "@/lib/permissions";
import { listVehicles } from "@/api/vehicles";
import { listDrivers } from "@/api/drivers";
import { listTrips } from "@/api/trips";

/**
 * ⌘K palette: jump to any page the current role can see, or straight to a
 * vehicle, driver, or trip. Records are only fetched for resources this role
 * is allowed to view, so the palette never surfaces a page that 403s.
 */
export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const navGroups = useNavGroups();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const canSeeVehicles = canView(user, "vehicles");
  const canSeeDrivers = canView(user, "drivers");
  const canSeeTrips = canView(user, "trips");

  // Only fetch once the palette has been opened at least once.
  const [primed, setPrimed] = useState(false);
  useEffect(() => {
    if (open) setPrimed(true);
  }, [open]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles", {}],
    queryFn: () => listVehicles({}),
    enabled: primed && canSeeVehicles,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: listDrivers,
    enabled: primed && canSeeDrivers,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: () => listTrips(),
    enabled: primed && canSeeTrips,
  });

  const go = (path) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Jump to a page, vehicle, driver, or trip"
    >
      <CommandInput placeholder="Search vehicles, drivers, trips, or pages…" />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {navGroups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.label} page`}
                  onSelect={() => go(item.href)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        {vehicles.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Vehicles">
              {vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={`${vehicle.registrationNumber} ${vehicle.name} ${vehicle.model ?? ""}`}
                  onSelect={() => go(`/vehicles/${vehicle.id}`)}
                >
                  <Truck size={15} aria-hidden="true" />
                  <span className="font-medium">{vehicle.registrationNumber}</span>
                  <span className="text-muted-foreground">{vehicle.name}</span>
                  <CommandShortcut>{vehicle.status.replace("_", " ")}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {drivers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Drivers">
              {drivers.map((driver) => (
                <CommandItem
                  key={driver.id}
                  value={`${driver.name} ${driver.licenseNumber}`}
                  onSelect={() => go(`/drivers/${driver.id}`)}
                >
                  <Users size={15} aria-hidden="true" />
                  <span className="font-medium">{driver.name}</span>
                  <span className="text-muted-foreground">{driver.licenseNumber}</span>
                  <CommandShortcut>{driver.status.replace("_", " ")}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {trips.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Trips">
              {trips.slice(0, 10).map((trip) => (
                <CommandItem
                  key={trip.id}
                  value={`${trip.source} ${trip.destination} ${trip.vehicleRegistration ?? ""} ${trip.driverName ?? ""}`}
                  onSelect={() => go(`/trips/${trip.id}`)}
                >
                  <RouteIcon size={15} aria-hidden="true" />
                  <span className="font-medium">
                    {trip.source} → {trip.destination}
                  </span>
                  <CommandShortcut>{trip.status}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            value="toggle theme dark light mode"
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              onOpenChange(false);
            }}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={15} aria-hidden="true" />
            ) : (
              <Moon size={15} aria-hidden="true" />
            )}
            Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
