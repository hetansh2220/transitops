import { Navigate } from "react-router-dom";
import { RegisterForm } from "@/components/register-form";
import { useAuth } from "@/context/AuthContext";

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterForm />;
};

export default RegisterPage;
