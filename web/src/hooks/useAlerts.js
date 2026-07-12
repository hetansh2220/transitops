import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { listMaintenanceLogs } from "@/api/maintenance";
import { listDrivers } from "@/api/drivers";

/** A licence inside this window is worth warning about. */
const LICENSE_WARNING_DAYS = 30;

/**
 * The backend has no notifications table, so alerts are derived from the two
 * conditions that actually need attention: vehicles sitting in the shop, and
 * driver licences about to lapse.
 */
export const useAlerts = () => {
  const maintenanceQuery = useQuery({
    queryKey: ["maintenance", { status: "open" }],
    queryFn: () => listMaintenanceLogs({ status: "open" }),
  });

  const driversQuery = useQuery({
    queryKey: ["drivers"],
    queryFn: listDrivers,
  });

  const alerts = [];

  for (const log of maintenanceQuery.data?.maintenanceLogs ?? []) {
    alerts.push({
      id: `maintenance-${log.id}`,
      severity: "warning",
      title: "Open maintenance",
      body: `${log.vehicleRegistration ?? log.vehicleName} — ${log.serviceType}`,
      href: `/maintenance/${log.id}`,
      date: log.date,
    });
  }

  for (const driver of driversQuery.data ?? []) {
    if (!driver.licenseExpiryDate) continue;

    const daysLeft = differenceInCalendarDays(
      parseISO(driver.licenseExpiryDate),
      new Date(),
    );
    if (daysLeft > LICENSE_WARNING_DAYS) continue;

    alerts.push({
      id: `license-${driver.id}`,
      severity: daysLeft < 0 ? "critical" : "warning",
      title: daysLeft < 0 ? "Licence expired" : "Licence expiring soon",
      body:
        daysLeft < 0
          ? `${driver.name} — expired ${Math.abs(daysLeft)}d ago`
          : `${driver.name} — expires in ${daysLeft}d`,
      href: `/drivers/${driver.id}`,
      date: driver.licenseExpiryDate,
    });
  }

  // Expired/critical first, then soonest.
  alerts.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return new Date(a.date) - new Date(b.date);
  });

  return {
    alerts,
    isLoading: maintenanceQuery.isLoading || driversQuery.isLoading,
    isError: maintenanceQuery.isError || driversQuery.isError,
  };
};
