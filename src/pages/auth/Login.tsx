import { useState } from "react";
import { Title } from "react-head";
import { useAuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuthContext();

    const navigate = useNavigate();
    const location = useLocation();

    // Recupera el lugar desde donde se intentó entrar
    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(email, password);

            if (!result) {
                setError("Credenciales incorrectas.");
            } else {
                // Redirige a la URL original
                navigate(from, { replace: true });
            }

        } catch (err: any) {
            const message = err.response?.data?.mensaje || "Error desconocido";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full justify-center bg-zinc-50 dark:bg-zinc-900 min-h-screen items-center">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col p-6 sm:p-8  rounded-lg gap-4 w-[82%] sm:w-full max-w-[400px] shadow-lg
                border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800
                text-gray-700 dark:text-zinc-100"
            >
                <div className="flex items-center justify-center gap-2">
                    <img src="./logo.png"
                        className="object-cover w-12 h-12 sm:w-16 sm:h-16"
                        alt="logo.png" />
                    <h1 className=" text-2xl sm:text-3xl font-bold">ASISLAB</h1>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-[30px] text-center font-semibold">Iniciar Sesión</h2>

                {error && (
                    <p className="text-center text-base sm:text-xl text-red-500 font-semibold">
                        {error}
                    </p>
                )}

                {loading && (
                    <p className="text-center text-base sm:text-xl text-blue-400 font-semibold">
                        Cargando...
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-sm sm:text-base">Correo Electrónico:</label>
                    <input
                        type="text"
                        className="w-full p-2 sm:p-3 border border-gray-300 dark:border-zinc-400 rounded-md text-sm sm:text-base"
                        placeholder="Ingresa tu correo electrónico..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm sm:text-base">Contraseña:</label>
                    <input
                        type="password"
                        className="w-full p-2 sm:p-3 border border-gray-300 dark:border-zinc-400 rounded-md text-sm sm:text-base"
                        placeholder="Ingresa tu contraseña..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base 
                    bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                    transition-all duration-200 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Inicializando..." : "Iniciar Sesión"}
                </button>
            </form>

            <Title>Inicio de sesión</Title>
        </div>
    );
}