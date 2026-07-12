import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "@/api/trips";

const KEY = "trips";

const errorMessage = (error, fallback) =>
  error.response?.data?.error ?? fallback;

export const useTrips = (filters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listTrips(filters),
  });

export const useTrip = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getTrip(id),
    enabled: Boolean(id),
  });

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Trip from ${trip.source} to ${trip.destination} created`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create trip")),
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateTrip(id, payload),
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [KEY, String(trip.id)] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Trip from ${trip.source} to ${trip.destination} updated`);
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update trip")),
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Trip deleted successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete trip")),
  });
};

export const useDispatchTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dispatchTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Trip dispatched successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not dispatch trip")),
  });
};

export const useCompleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => completeTrip(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (res.fuelLog) {
        queryClient.invalidateQueries({ queryKey: ["fuel"] });
      }
      toast.success("Trip completed successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not complete trip")),
  });
};

export const useCancelTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Trip cancelled");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not cancel trip")),
  });
};
