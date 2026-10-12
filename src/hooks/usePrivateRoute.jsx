import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useInitUser } from "@/hooks/useInitUser.jsx";

const PrivateRoute = ({
  children,
  requireAdmin = false,
  requiredPermissions = [],
}) => {
  useInitUser();

  const { isAuthenticated, user, permissions, permissionsLoaded } = useAuth();

  const location = useLocation();

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    // Super-Admin or administrative roles bypass permission checks
    const isAdmin =
      user?.type === "Super-Admin" ||
      user?.role === "admin" ||
      user?.role === "founder" ||
      user?.role === "ceo" ||
      user?.role === "coo" ||
      user?.role === "cto";

    if (isAdmin) {
      return children;
    }

    // Wait for permissions to load before checking
    if (!permissionsLoaded) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0CABA8]"></div>
        </div>
      );
    }

    // Check permissions only after they're loaded
    const hasPermission =
      !requiredPermissions.length ||
      requiredPermissions.some((perm) => permissions.includes(perm));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
