import { Outlet } from "react-router-dom";

/**
 * AuthLayout
 * Wraps unauthenticated pages (Login, Register).
 * Provides a centered container for auth forms.
 */
const AuthLayout = () => {
  return (
    <div id="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
