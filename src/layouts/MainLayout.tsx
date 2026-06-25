import { Link, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { FaSignOutAlt, FaSignInAlt, FaUser } from "react-icons/fa";

export function MainLayout() {
    const { user, isGuest, loading, quitGuest } = useAuthContext()

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 transition-colors">
            <header className="">
                <nav className="sticky top-0 left-0 w-full z-50 px-6 py-3 
                border-b border-gray-200 dark:border-zinc-600">
                    <div className="flex items-center justify-between h-full gap-5">
                        <div>
                                <Link
                                    to={"/"}
                                    className="flex items-center gap-2 font-semibold 
                                    text-gray-700 hover:text-blue-600 dark:text-zinc-100
                                    transition-transform duration-200 ease-out hover:scale-105">
                                    <img src="/logo.png"
                                        className="object-cover w-12 h-12"
                                        alt="logo.png" />
                                    <h1 className="text-2xl font-bold">ASISLAB</h1>
                                </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-100">
                                <FaUser size={20} className="text-lg" />
                                <p>Guest</p>
                                {loading ? (
                                    <p className="animate-spin w-5 h-5 
                                    border-2 border-gray-400 dark:border-zinc-500 
                                    border-t-transparent rounded-full"></p>
                                ) :
                                    <p className="hidden sm:block text-lg font-medium">{user ? user.name : ""}</p>
                                }
                            </div>

                            {isGuest ? (
                                <button
                                    onClick={quitGuest}
                                    className="flex items-center gap-2 px-4 py-2 text-lg rounded-md font-medium 
                                    border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700
                                    text-gray-700 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-600 active:scale-95  
                                    transition cursor-pointer"
                                >
                                    <FaSignOutAlt size={20} />
                                    <span className="hidden sm:inline">Cerrar sesión</span>
                                </button>

                            ) : (
                                <Link to="/login">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 text-lg rounded-md font-medium 
                                        border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700
                                        text-gray-700 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-600 active:scale-95  
                                        transition cursor-pointer"
                                    >
                                        <FaSignInAlt size={20} />
                                        Iniciar sesión
                                    </button>
                                </Link>
                            )}
                        </div>

                    </div>
                </nav>
            </header>

            <main className="m-6 text-gray-700 dark:text-zinc-100">
                <div className="container mx-auto rounded-md">
                    <Outlet />
                </div>
            </main>

            <footer className="flex items-center justify-center p-5 shadow-xs
            border-t border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 transition-colors">
                <p>© {new Date().getFullYear()} ASISLAB</p>
            </footer>
        </div>
    )
}