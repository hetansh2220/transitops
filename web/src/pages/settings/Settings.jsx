import { useTheme } from "next-themes";
import { Check, Minus, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, VIEW_ROLES, WRITE_ROLES } from "@/lib/permissions";

/** The resources shown as columns, in the order the wireframe lists them. */
const RESOURCES = [
  { key: "vehicles", label: "Fleet" },
  { key: "drivers", label: "Drivers" },
  { key: "trips", label: "Trips" },
  { key: "maintenance", label: "Maintenance" },
  { key: "fuelLogs", label: "Fuel" },
  { key: "expenses", label: "Expenses" },
  // Reports are computed, so no role writes them — every cell is view or hidden.
  { key: "reports", label: "Analytics" },
];

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account and the access rules that apply to it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="flex flex-col gap-6">
          {/* ── Profile ─────────────────────────────── */}
          <section className="rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold">Profile</h2>

            <div className="mt-4 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-foreground text-background text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <dl className="mt-5 border-t border-border pt-4">
              <dt className="text-xs text-muted-foreground">Role</dt>
              <dd className="mt-1 text-sm font-medium">{ROLE_LABELS[user.role]}</dd>
            </dl>
          </section>

          {/* ── Appearance ──────────────────────────── */}
          <section className="rounded-lg border border-border p-5">
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose how TransitOps looks on this device.
            </p>

            <div className="mt-4 flex gap-2">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          </section>
        </div>

        {/* ── RBAC matrix ───────────────────────────── */}
        <section className="rounded-lg border border-border">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Role-based access</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Generated from the same rules the API enforces.{" "}
              <span className="text-emerald-600 dark:text-emerald-400">✓</span> read and
              write · <span className="font-medium">view</span> read-only ·{" "}
              <span className="font-medium">—</span> hidden
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  {RESOURCES.map((resource) => (
                    <TableHead key={resource.key} className="text-center">
                      {resource.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <TableRow
                    key={role}
                    className={cn(role === user.role && "bg-muted/50")}
                  >
                    <TableCell className="font-medium">
                      {label}
                      {role === user.role && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </TableCell>

                    {RESOURCES.map((resource) => {
                      const write = WRITE_ROLES[resource.key]?.includes(role);
                      const view = VIEW_ROLES[resource.key]?.includes(role);

                      return (
                        <TableCell key={resource.key} className="text-center">
                          {write ? (
                            <>
                              <Check
                                size={15}
                                aria-hidden="true"
                                className="mx-auto text-emerald-600 dark:text-emerald-400"
                              />
                              <span className="sr-only">Read and write</span>
                            </>
                          ) : view ? (
                            <span className="text-xs text-muted-foreground">view</span>
                          ) : (
                            <>
                              <Minus
                                size={15}
                                aria-hidden="true"
                                className="mx-auto text-muted-foreground/40"
                              />
                              <span className="sr-only">No access</span>
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
            Write access is enforced by the API — a role without a check cannot
            change that data even by calling the endpoint directly. Hidden pages are
            a navigation convenience; the server remains the source of truth.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
