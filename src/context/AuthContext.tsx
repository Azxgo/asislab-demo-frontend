import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/visuals/Spinner";

interface User {
  id: string;
  name: string;
  email: string;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout?: () => Promise<any>;
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

  const navigate = useNavigate();

  // Verifica si el usuario esta logueado o no
  const checkUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/check", { withCredentials: true })
      setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        rol: res.data.rol
      })
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/register",
        { name, email, password },
        { withCredentials: true }
      );
      setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        rol: res.data.rol
      });
      return res.data;
    } catch (err: any) {
      console.error(err.response?.data || err);
      throw err;
    }
  }

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        { withCredentials: true }
      );
      // Setea el usuario en el context, para que la sesion este en toda la pagina.
      setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        rol: res.data.rol
      });
      return res.data;
    } catch (err: any) {
      console.error(err.response?.data || err);
      throw err;
    }
  }

  // Logout
  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
      setUser(null);
      console.log("usuario deslogueado")
      navigate("/login");
    } catch (err: any) {
      console.error(err.response?.data || err);
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}