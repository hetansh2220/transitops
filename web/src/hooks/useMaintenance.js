import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMaintenanceLog,
  deleteMaintenanceLog,
  listMaintenanceLogs,
  updateMaintenanceLog,
} from "@/api/maintenance";

const KEY = "maintenance";

const errorMessage = (error, fallback) => error.response?.data?.error ?? fallback;

/**
 * Opening or closing a log flips the vehicle between in_shop and available, so
 * every mutation here has to invalidate vehicles and the dashboard too.
 */
const invalidateAll = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: [KEY] });
  queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
};

/** @param filters - { vehicleId, status } */
export const useMaintenanceLogs = (filters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listMaintenanceLogs(filters),
  });

export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: ({ vehicle }) => {
      invalidateAll(queryClient);
      toast.success(
        vehicle?.status === "in_shop"
          ? `${vehicle.registrationNumber} sent to the shop`
          : "Maintenance record added",
      );
    },
    // Covers "already open for this vehicle" and "vehicle is on a trip".
    onError: (error) => toast.error(errorMessage(error, "Could not save the record")),
  });
};

export const useUpdateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateMaintenanceLog(id, payload),
    onSuccess: ({ maintenanceLog, vehicle }) => {
      invalidateAll(queryClient);
      toast.success(
        maintenanceLog?.status === "closed"
          ? `${vehicle?.registrationNumber ?? "Vehicle"} returned to service`
          : "Maintenance record updated",
      );
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update the record")),
  });
};

export const useDeleteMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaintenanceLog,
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Maintenance record deleted");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not delete the record")),
  });
};
