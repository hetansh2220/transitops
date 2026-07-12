import { useQuery } from "@tanstack/react-query";
import { listDrivers, getDriver } from "@/api/drivers";

const KEY = "drivers";

export const useDrivers = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: listDrivers,
  });
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDriver,
  deleteDriver,
  getDriver,
  listDrivers,
  updateDriver,
} from "@/api/drivers";

const KEY = "drivers";

const errorMessage = (error, fallback) => error.response?.data?.error ?? fallback;

export const useDrivers = () =>
  useQuery({ queryKey: [KEY], queryFn: listDrivers });

export const useDriver = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getDriver(id),
    enabled: Boolean(id),
  });

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDriver,
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success(`Driver ${driver.name} added`);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not add driver")),
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateDriver(id, payload),
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      // Driver counts feed the dashboard's "on duty" KPI.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Driver ${driver.name} updated`);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update driver")),
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success("Driver removed");
    },
    // The API refuses to delete a driver who has trips on record — surface that.
    onError: (error) => toast.error(errorMessage(error, "Could not remove driver")),
  });
};
