import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useAppContext } from "../AppContaxt";
import { useFrappeAuth } from "./frappeAuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { API_METHOD } = useAppContext();
  const { token, isInitialized } = useAuth();
  const { user, loading } = useFrappeAuth();

  if (API_METHOD === "FRAPPE") {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <span className="text-lg font-medium">Loading frappe auth ...</span>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  if (API_METHOD === "FAST_API") {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <span className="text-lg font-medium">Loading auth ...</span>
        </div>
      );
    }

    if (!token) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;