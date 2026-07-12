import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/permissions";
import { DEMO_ACCOUNTS, DEMO_MODE, DEMO_PASSWORD } from "@/constants/demoAccounts";

/**
 * A strip above the navbar listing the seeded demo logins, so a reviewer can
 * jump between roles and watch the RBAC change without typing credentials.
 * Clicking a role signs straight into it.
 */
export default function DemoBanner() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState(false);
  const [switching, setSwitching] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!DEMO_MODE || dismissed) return null;

  const switchTo = async (account) => {
    if (account.email === user?.email) return;

    setSwitching(account.email);
    try {
      // Drop the current session first, or the old refresh cookie lingers.
      await logout();
      await login({ email: account.email, password: DEMO_PASSWORD });
      navigate("/dashboard", { replace: true });
      toast.success(`Signed in as ${ROLE_LABELS[account.role]}`);
    } catch {
      toast.error("Could not switch account. Has the database been seeded?");
    } finally {
      setSwitching(null);
    }
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(DEMO_PASSWORD);
    setCopied(true);
    toast.success("Password copied");
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-muted/40 px-4 py-1.5 text-xs">
      <span className="font-medium text-muted-foreground">Demo accounts</span>

      <div className="flex flex-wrap items-center gap-1.5">
        {DEMO_ACCOUNTS.map((account) => {
          const isCurrent = account.email === user?.email;

          return (
            <button
              key={account.email}
              type="button"
              onClick={() => switchTo(account)}
              disabled={Boolean(switching) || isCurrent}
              title={account.email}
              className={cn(
                "rounded-md border px-2 py-0.5 transition-colors duration-150",
                "disabled:cursor-default",
                isCurrent
                  ? "border-success/30 bg-success-muted text-success"
                  : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              )}
            >
              {switching === account.email
                ? "Signing in…"
                : ROLE_LABELS[account.role]}
              {isCurrent && " ✓"}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={copyPassword}
        className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="font-numeric">{DEMO_PASSWORD}</span>
        {copied ? (
          <Check size={12} aria-hidden="true" className="text-success" />
        ) : (
          <Copy size={12} aria-hidden="true" />
        )}
        <span className="sr-only">Copy demo password</span>
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Hide demo accounts"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
