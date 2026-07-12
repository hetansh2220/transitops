import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listFuelLogs,
  getFuelLog,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
} from "@/api/fuelLogs";

const KEY = "fuel";

const errorMessage = (error, fallback) =>
  error.response?.data?.error ?? fallback;

export const useFuelLogs = (filters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listFuelLogs(filters),
  });

export const useFuelLog = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getFuelLog(id),
    enabled: Boolean(id),
  });

export const useCreateFuelLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Fuel log added successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not log fuel")),
  });
};

export const useUpdateFuelLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateFuelLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Fuel log updated successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update fuel log")),
  });
};

export const useDeleteFuelLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Fuel log deleted successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete fuel log")),
  });
};
