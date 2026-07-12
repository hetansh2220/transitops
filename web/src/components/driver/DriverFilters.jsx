import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DRIVER_STATUS_LABELS } from "@/constants/driverStatus";

export const ALL = "all";

const DriverFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset,
}) => {
  const isFiltered = search || status !== ALL;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={15}
          aria-hidden="true"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name or licence number…"
          aria-label="Search drivers"
          className="pl-8"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {Object.entries(DRIVER_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button variant="ghost" onClick={onReset} className="sm:w-auto">
          <X size={14} aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  );
};

export default DriverFilters;
