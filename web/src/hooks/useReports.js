import { useQuery } from "@tanstack/react-query";
import { getVehicleReport } from "@/api/reports";

/** @param filters - { type, region } — applied server-side. */
export const useVehicleReport = (filters = {}) =>
  useQuery({
    queryKey: ["reports", "vehicles", filters],
    queryFn: () => getVehicleReport(filters),
  });
