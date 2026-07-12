import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
