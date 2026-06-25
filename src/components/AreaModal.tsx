
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./visuals/Spinner";
import apiClient from "../config/apiClient";

interface ModalProps {
    id: string | null,
    isOpen: boolean;
    onClose: () => void
    onSave: () => void;
}

export function AreaModal({ id, isOpen, onClose, onSave }: ModalProps) {
    const [name, setName] = useState("")
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (id) {
            setIsLoading(true)
            apiClient.get(`/areas/get/${id}`)
                .then(res => setName(res.data.area.nombre))
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false))
        } else {
            setName("")
        }
        setMessage("")
    }, [id])

    const handleSave = async () => {
        if (!name.trim()) {
            setMessage("Este campo es obligatorio")
            return
        }
        try {
            setIsLoading(true)
            if (id) {
                await apiClient.put(`/areas/update/${id}`, { nombre: name }, {})
            } else {
                await apiClient.post(`/areas/create`, { nombre: name }, {})
            }
            setName("")
            setMessage("")
            onSave()
            onClose()
        } catch (err: any) {
            setMessage(err.response?.data?.error || "No se pudo guardar el área")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.30 }}
                            >
                                <Spinner />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="loaded"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.30 }}
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">{id ? "Editar Área" : "Agregar Área"}</h2>
                                        <button
                                            className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                            onClick={onClose}
                                        >
                                            <FaXmark size={20} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Nombre</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="flex w-full items-center justify-center gap-2 py-2 
                                        bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                                        transition-all duration-200 cursor-pointer
                                        hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        Guardar
                                        {isLoading && (
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        )}
                                    </button>

                                    <div className="flex flex-col justify-center items-center">
                                        {message && <p className="text-gray-600 dark:text-gray-300">{message}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}