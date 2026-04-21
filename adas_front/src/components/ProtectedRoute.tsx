import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const access_token = true;
  if (!access_token) {
    return <Navigate to="/panel/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
