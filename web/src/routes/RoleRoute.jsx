import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Blocks a route unless the user holds one of `allow`.
 * Cosmetic only — requireRole() on the server is what actually enforces this.
 */
const RoleRoute = ({ allow, children }) => {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default RoleRoute;
