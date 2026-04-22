import { Navigate, Outlet, useParams, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { Spinner } from "../visuals/Spinner";


export const ProtectRoutesQuestionary = () => {
  const { user } = useAuthContext();
  const { id } = useParams<{ id: string }>();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const location = useLocation();

  // --- Si NO hay usuario, redirige al login usando "from" ---
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  useEffect(() => {
    const checkAccess = async () => {
      if (!id || !user.email) return setHasAccess(false);

      if (user.rol === "administrador") {
        setHasAccess(true);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/workers/check_access/${id}?email=${user.email}`,
          { withCredentials: true }
        );

        setHasAccess(res.data.access);

      } catch (err) {
        console.error("Error al verificar acceso:", err);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [id, user]);

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