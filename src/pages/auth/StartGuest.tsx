import { useState } from "react";
import { Title } from "react-head";
import { useAuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function StartGuest() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { startGuest } = useAuthContext();

    const navigate = useNavigate();
    const location = useLocation();

    // Recupera el lugar desde donde se intentó entrar
    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await startGuest();

            // Redirige a la URL original
            navigate(from, { replace: true });


        } catch (err: any) {
            const message = err.response?.data?.mensaje || "Error desconocido";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full justify-center bg-zinc-50 dark:bg-zinc-900 min-h-screen items-center">
            <div className="absolute top-15 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-lg p-2 dark:text-white shadow-lg">
                El backend utiliza un servicio gratuito. La primera carga puede tardar aproximadamente 30 segundos.
            </div>
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


                <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base 
                    bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                    transition-all duration-200 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Inicializando..." : "Iniciar como invitado"}
                </button>
            </form>

            <Title>Inicio</Title>
        </div>
    );
}