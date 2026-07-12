import { useState, useMemo } from "react";
import { Plus, Receipt, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExpenseTable from "@/components/expense/ExpenseTable";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { useVehicles } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";

const ALL = "all";
const number = (value) => Number(value ?? 0).toLocaleString();

const EXPENSE_TYPES = [
  { value: "toll", label: "Toll" },
  { value: "parking", label: "Parking" },
  { value: "permit", label: "Permit" },
  { value: "other", label: "Other" },
];

const ExpenseListPage = () => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWrite = can("expenses");

  const [selectedVehicle, setSelectedVehicle] = useState(ALL);
  const [selectedType, setSelectedType] = useState(ALL);

  const { data: vehicles = [] } = useVehicles();
  const deleteExpense = useDeleteExpense();

  const queryParams = useMemo(() => {
    const params = {};
    if (selectedVehicle !== ALL) params.vehicleId = selectedVehicle;
    if (selectedType !== ALL) params.type = selectedType;
    return params;
  }, [selectedVehicle, selectedType]);

  const { data, isLoading, isError, error } = useExpenses(queryParams);
  const expenses = data?.expenses ?? [];

  const metrics = useMemo(() => {
    let total = 0;
    let toll = 0;
    let parking = 0;
    let permit = 0;
    let other = 0;

    expenses.forEach((exp) => {
      const amt = Number(exp.amount ?? 0);
      total += amt;
      if (exp.type === "toll") toll += amt;
      else if (exp.type === "parking") parking += amt;
      else if (exp.type === "permit") permit += amt;
      else other += amt;
    });

    return { total, toll, parking, permit, other };
  }, [expenses]);

  const resetFilters = () => {
    setSelectedVehicle(ALL);
    setSelectedType(ALL);
  };

  const handleDelete = (exp) => {
    if (window.confirm(`Are you sure you want to delete expense #${exp.id}?`)) {
      deleteExpense.mutate(exp.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track business travel costs, toll fares, parking charges, and route permit fees.
          </p>
        </div>

        {canWrite && (
          <Button onClick={() => navigate("/expenses/new")} className="w-fit">
            <Plus size={16} aria-hidden="true" />
            Add Expense
          </Button>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Expenses",
            value: `$${number(metrics.total.toFixed(2))}`,
          },
          {
            label: "Tolls Total",
            value: `$${number(metrics.toll.toFixed(2))}`,
          },
          {
            label: "Parking Total",
            value: `$${number(metrics.parking.toFixed(2))}`,
          },
          {
            label: "Permits Total",
            value: `$${number(metrics.permit.toFixed(2))}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Filter by vehicle">
            <SelectValue placeholder="Filter by vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.registrationNumber} ({v.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by expense type">
            <SelectValue placeholder="Expense Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {EXPENSE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedVehicle !== ALL || selectedType !== ALL) && (
          <Button variant="ghost" onClick={resetFilters} className="sm:w-auto">
            <X size={14} aria-hidden="true" />
            Reset filters
          </Button>
        )}
      </div>

      <section className="rounded-lg border border-border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-semibold">Couldn&apos;t load expenses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.response?.data?.error ?? error.message}
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full border border-border p-4">
              <Receipt size={22} aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No expenses found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedVehicle === ALL && selectedType === ALL
                  ? "Log travel expenses to keep financial calculations updated."
                  : "No expense records match the selected filters."}
              </p>
            </div>
            {(selectedVehicle !== ALL || selectedType !== ALL) && (
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses}
            canWrite={canWrite}
            onEdit={(exp) => navigate(`/expenses/${exp.id}/edit`)}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
};

export default ExpenseListPage;
