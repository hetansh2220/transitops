import { Link } from "react-router-dom";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const number = (value) => Number(value ?? 0).toLocaleString();

const EXPENSE_TYPE_LABELS = {
  toll: "Toll",
  parking: "Parking",
  permit: "Permit",
  other: "Other",
};

const ExpenseTable = ({ expenses, canWrite, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[80px]">ID</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Assigned Trip</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead>Date</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>

    <TableBody>
      {expenses.map((exp) => (
        <TableRow key={exp.id}>
          <TableCell className="font-mono text-xs">#{exp.id}</TableCell>
          <TableCell className="font-medium">
            {exp.vehicleRegistration ?? `ID: ${exp.vehicleId}`}
          </TableCell>
          <TableCell>
            {exp.tripId ? (
              <Link
                to={`/trips/${exp.tripId}`}
                className="text-primary hover:underline font-medium text-xs"
              >
                {exp.tripSource && exp.tripDestination
                  ? `${exp.tripSource} → ${exp.tripDestination}`
                  : `Trip #${exp.tripId}`}
              </Link>
            ) : (
              <span className="text-muted-foreground text-xs">—</span>
            )}
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {EXPENSE_TYPE_LABELS[exp.type] ?? exp.type}
            </span>
          </TableCell>
          <TableCell className="max-w-[200px] truncate" title={exp.description}>
            {exp.description || "—"}
          </TableCell>
          <TableCell className="text-right font-medium tabular-nums">
            ${number(exp.amount)}
          </TableCell>
          <TableCell className="tabular-nums">
            {exp.date ? new Date(exp.date).toLocaleDateString() : "—"}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for expense #${exp.id}`}>
                  <MoreHorizontal size={16} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canWrite ? (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(exp)} className="gap-2">
                      <Edit2 size={14} aria-hidden="true" />
                      Edit expense
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(exp)}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete expense
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled>No actions allowed</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default ExpenseTable;
