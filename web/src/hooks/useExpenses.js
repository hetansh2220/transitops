import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/api/expenses";

const KEY = "expenses";

const errorMessage = (error, fallback) =>
  error.response?.data?.error ?? fallback;

export const useExpenses = (filters = {}) =>
  useQuery({
    queryKey: [KEY, filters],
    queryFn: () => listExpenses(filters),
  });

export const useExpense = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => getExpense(id),
    enabled: Boolean(id),
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Expense logged successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not create expense")),
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Expense updated successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not update expense")),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Could not delete expense")),
  });
};
