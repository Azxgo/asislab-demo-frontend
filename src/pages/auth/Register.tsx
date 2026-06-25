

import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Title } from "react-head";

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const { register } = useAuthContext();

    const navigate = useNavigate()
    const location = useLocation()

    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(name.trim());
        if (!onlyLetters) {
            setError("El nombre solo puede contener letras y espacios");
            return;
        }

        setLoading(true)

        try {
            const result = await register(name, email, password);
            setLoading(false)
            if (!result) {
                setError("Invalid");
            } else {
                navigate(from, { replace: true })
            }
        } catch (err: any) {
            const message = err.response?.data?.mensaje || "Error desconocido";
            setError(message);
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="flex w-full justify-center bg-zinc-50 dark:bg-zinc-900 h-screen items-center">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col p-8 rounded-lg gap-4 w-full max-w-[400px] shadow-lg
                border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800
                text-gray-700 dark:text-zinc-10 "
            >
                <div className="flex items-center justify-center gap-2">
                    <img src="./logo.png"
                        className="object-cover w-16 h-16"
                        alt="logo.png" />
                    <h1 className=" text-3xl font-bold">ASISLAB</h1>
                </div>
                <h2 className="text-[30px] text-center font-bold">Registro</h2>

                {error && <p className="text-center text-xl text-red-500 font-semibold">{error}</p>}
                {loading && <p className="text-center text-xl text-blue-400 font-semibold">Cargando...</p>}

                <div className="flex flex-col gap-2">
                    <label htmlFor="">Nombre:</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 dark:border-zinc-400] rounded-md"
                        placeholder="Ingresa tu nombre completo..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="" >Correo Electrónico:</label>
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 dark:border-zinc-400 rounded-md"
                        placeholder="Ingresa tu correo electrónico..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="" >Contraseña:</label>
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 dark:border-zinc-400 rounded-md"
                        placeholder="Ingresa tu contraseña..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 py-2 
                    bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                    transition-all duration-200 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Registrando..." : "Crear Cuenta"}
                </button>
            </form>
            <Title>Registro de usuario</Title>
        </div>
    );
}