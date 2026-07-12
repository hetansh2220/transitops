import { Link, Outlet } from "react-router-dom";
import { Truck } from "lucide-react";

/**
 * AuthLayout
 * Wraps unauthenticated pages (Login, Register).
 * Provides a centered container for auth forms.
 */
const AuthLayout = () => {
  return (
    <div
      id="auth-layout"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10"
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/login"
          className="flex items-center gap-2 self-center text-lg font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Truck size={16} aria-hidden="true" />
          </span>
          TransitOps
        </Link>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
