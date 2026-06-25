import { Navigate, Outlet, useParams, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { Spinner } from "../visuals/Spinner";
import apiClient from "../../config/apiClient";


export const ProtectRoutesQuestionary = () => {
  const { isGuest } = useAuthContext();
  const { id } = useParams<{ id: string }>();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  if (!isGuest) {
    return <Navigate to="/start" state={{ from: location }} replace />;
  }

  useEffect(() => {
    const checkAccess = async () => {
      if (!id) return setHasAccess(false);

      try {

        const res = await apiClient.get(
          `/workers/check_access/${id}`,
        );

        setHasAccess(res.data.access);

      } catch (err) {
        console.error("Error al verificar acceso:", err);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [id]);

  if (hasAccess === null) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center">
        <Spinner />
        <p className="text-gray-800">Verificando Acceso...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/access-denied" />;
  }

  return <Outlet />;
};