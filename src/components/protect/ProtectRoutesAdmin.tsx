import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export const ProtectRoutesAdmin = () => {
  const { user} = useAuthContext();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.rol !== "administrador") {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};