
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import Forbidden from "./Forbidden";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but role is not allowed
  if (
    isAuthenticated &&
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return <Forbidden />;
  }

  // If user is authenticated and role is allowed (or no roles specified)
  return <>{children}</>;
}
