import { Navigate } from "react-router-dom";
import { useAuthStore, selectIsAuthenticated } from "../../stores/authStore";
import { PageSkeleton } from "../Skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const token = useAuthStore((state) => state.token);
  // Show loading while checking auth (token exists but state not fully hydrated)
  if (token && !isAuthenticated) {
    return <PageSkeleton />;
  }

  // Redirect to unauthorized page if not authenticated
  if (!isAuthenticated && !token) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
