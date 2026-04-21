import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
