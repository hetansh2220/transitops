import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
  updateVehicleStatus,
} from "@/api/vehicles";

const KEY = "vehicles";

const errorMessage = (error, fallback) =>
  error.response?.data?.error ?? fallback;

/** @param filters - { status, type, region, search } — applied server-side. */
export const useVehicles = (filters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listVehicles(filters),
  });

export const useVehicle = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
  });

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success(`Vehicle ${vehicle.registrationNumber} created`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create vehicle")),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateVehicle(id, payload),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success(`Vehicle ${vehicle.registrationNumber} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update vehicle")),
  });
};

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateVehicleStatus(id, status),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      // A retired vehicle drops out of the dashboard's operational counts.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Vehicle ${vehicle.registrationNumber} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not change status")),
  });
};
