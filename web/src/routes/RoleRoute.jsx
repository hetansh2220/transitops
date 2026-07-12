import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/permissions";

/**
 * Blocks a route unless the user holds one of `allow`.
 * Cosmetic only — requireRole() on the server is what actually enforces this.
 */
const RoleRoute = ({ allow, children }) => {
  const { user } = useAuth();
  const denied = !user || !allow.includes(user.role);

  // A silent redirect looks like a broken link. Say why they bounced.
  useEffect(() => {
    if (denied && user) {
      toast.error(`${ROLE_LABELS[user.role]} doesn't have access to that page.`);
    }
  }, [denied, user]);

  if (denied) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default RoleRoute;
