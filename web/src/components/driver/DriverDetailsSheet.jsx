import { AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import DriverStatusBadge from "@/components/driver/DriverStatusBadge";
import { isLicenseExpired } from "@/constants/driverStatus";

const Row = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value ?? "—"}</p>
  </div>
);

const DriverDetailsSheet = ({ open, onOpenChange, driver, tripCount }) => {
  if (!driver) return null;

  const expired = isLicenseExpired(driver);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl">{driver.name}</SheetTitle>
          <SheetDescription>
            {driver.licenseCategory} • {driver.licenseNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Current status</p>
            <DriverStatusBadge status={driver.status} />
          </div>

          {expired && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <p>
                Licence expired on {driver.licenseExpiryDate}. This driver is blocked
                from trip assignment.
              </p>
            </div>
          )}

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Licence number" value={driver.licenseNumber} />
            <Row label="Category" value={driver.licenseCategory} />
            <Row label="Licence expiry" value={driver.licenseExpiryDate} />
            <Row label="Contact" value={driver.contactNumber} />
            <Row
              label="Safety score"
              value={`${Number(driver.safetyScore).toFixed(0)} / 100`}
            />
            <Row label="Trips completed" value={tripCount ?? 0} />
            <Row
              label="Added"
              value={
                driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : null
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DriverDetailsSheet;
