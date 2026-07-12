import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";
import { DEMO_ACCOUNTS, DEMO_MODE, DEMO_PASSWORD } from "@/constants/demoAccounts";

/**
 * Demo-only card under the auth forms: the four seeded logins.
 *
 * `onPick` hands the credentials back to the form so a click fills it in —
 * a reviewer shouldn't have to retype an email to see a different role.
 */
export default function DemoAccountsCard({ onPick }) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(null);

  if (!DEMO_MODE || dismissed) return null;

  const copy = async (event, email) => {
    // The row itself fills the form; the icon only copies.
    event.stopPropagation();
    await navigator.clipboard.writeText(email);
    setCopied(email);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-medium">Demo accounts</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hide demo accounts"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-0.5 text-muted-foreground">
        Click one to fill the form. Password:{" "}
        <span className="font-numeric font-medium text-foreground">
          {DEMO_PASSWORD}
        </span>
      </p>

      <ul className="mt-2.5 flex flex-col gap-1" role="list">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              onClick={() => onPick?.(account.email, DEMO_PASSWORD)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
                "transition-colors duration-150 hover:bg-accent",
              )}
            >
              <span className="w-28 shrink-0 font-medium">
                {ROLE_LABELS[account.role]}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {account.email}
              </span>

              <span
                role="button"
                tabIndex={-1}
                aria-label={`Copy ${account.email}`}
                onClick={(event) => copy(event, account.email)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied === account.email ? (
                  <Check size={12} aria-hidden="true" className="text-success" />
                ) : (
                  <Copy size={12} aria-hidden="true" />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
