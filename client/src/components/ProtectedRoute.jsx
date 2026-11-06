import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeFor } from "../utils/roles";

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={homeFor[user.role]} replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={homeFor[user.role]} replace />;
  return children;
}
