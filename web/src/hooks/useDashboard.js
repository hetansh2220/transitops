import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/dashboard";

/** @param filters - { type, status, region } — applied server-side. */
export const useDashboard = (filters = {}) =>
  useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => getDashboard(filters),
  });
