import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/visuals/Spinner";
import apiClient from "../config/apiClient";

interface User {
  id: string;
  name: string;
  email: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  quitGuest: () => Promise<any>;
  startGuest: () => Promise<any>;

}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext debe ser utilizado con un AuthProvider");
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isGuest, setIsGuest] = useState(false)

  const navigate = useNavigate();

  const startGuest = async () => {
    try {

      let deviceId = localStorage.getItem("device_id")

      if (!deviceId) {
        deviceId = crypto.randomUUID()
        localStorage.setItem("device_id", deviceId)
      }

      const res = await apiClient.post("/auth/guest", {},
        {
          headers: {
            "X-Device-Id": deviceId
          }
        }
      )

      localStorage.setItem("guest_session_id", res.data.session_id)
      localStorage.setItem("guest_expires_at", res.data.expires_at)

      setUser(null)
      setIsGuest(true)

      return res.data
    } catch (err) {
      console.error(err)
    }
  }

  // Verifica si el usuario esta logueado o no usando el LocalStorage
  const checkUser = async () => {
    const guestSession = localStorage.getItem("guest_session_id");

    if (!guestSession) {
      setIsGuest(false);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/auth/check");

      if (!res.data.valid) {
        quitGuest()

        setIsGuest(false);
        navigate("/start");
      } else {
        setIsGuest(true);
      }
    } catch (err) {
      console.error(err);
      setIsGuest(false);
    }

    setLoading(false);
  };

  const quitGuest = async () => {
    try {
      await apiClient.post("/auth/quitGuest");
    } catch (err: any) {
      console.error(err.response?.data || err);
    } finally {
      localStorage.removeItem("guest_session_id");
      localStorage.removeItem("guest_expires_at");
      setIsGuest(false);
      navigate("/start");
    }
  }

  useEffect(() => {
    checkUser();

    const interval = setInterval(() => {
      checkUser();
    }, 60000); 

    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, startGuest, quitGuest }}>
      {children}
    </AuthContext.Provider>
  )
}