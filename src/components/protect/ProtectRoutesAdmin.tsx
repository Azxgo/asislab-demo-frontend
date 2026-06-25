import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export const ProtectRoutesAdmin = () => {
  const { isGuest, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return null; // o spinner
  }

  if (!isGuest) {
    return <Navigate to="/start" state={{ from: location }} replace />;
  }

  return <Outlet />;
};