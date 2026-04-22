import axios from "axios";
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./visuals/Spinner";

interface QuestionaryEditModalProps {
    id: string,
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function QuestionaryEditModal({ id, isOpen, onClose, onSave }: QuestionaryEditModalProps) {
    // Parametros a cambiar
    const [name, setName] = useState("");
    const [area, setArea] = useState("");
    const [areasList, setAreasList] = useState<{ _id: string, nombre: string }[]>([])
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("")
    // Mensajes y cargas
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const today = new Date().toISOString().split("T")[0];

    // CsrfToken
    const csrfToken = Cookies.get("csrf_access_token");

    // Cargar lista de áreas
    const fetchAreasList = async () => {
        try {
            const res = await axios.get("http://localhost:5000/areas/getAll");
            setAreasList(res.data.areas);
        } catch (err) {
            console.error("Error al cargar áreas:", err);
        }
    };

    const fetchQuestionary = async () => {
        if (!id) return;
        setIsLoading(true);
        setMessage("");
        try {
            const res = await axios.get(`http://localhost:5000/questions/get_stats/${id}`);
            const q = res.data;
            setName(q.nombre || "");
            setArea(q.area_id || "");
            setStartDate(q.fecha_comienzo ? q.fecha_comienzo.split("T")[0] : "");
            setEndDate(q.fecha_limite ? q.fecha_limite.split("T")[0] : "");
            setStatus(q.estado || "en espera");
        } catch (err) {
            console.error(err);
            setMessage("Error al cargar el cuestionario");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name) {
            setMessage("El nombre es obligatorio");
            return;
        }

        setIsLoading(true);
        setMessage("");

        const stop = (msg: string) => {
            setMessage(msg);
            setIsLoading(false);
        };

        if (startDate > endDate)
            return stop("La fecha de comienzo no puede ser mayor que la fecha límite");

        try {
            const payload = {
                nombre: name,
                area_id: area,
                fecha_comienzo: startDate || undefined,
                fecha_limite: endDate || undefined,
                estado: status,
            };

            await axios.put(
                `http://localhost:5000/questions/edit/${id}`,
                payload,
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            );

            setMessage("Cuestionario actualizado correctamente");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setMessage("Error al actualizar el cuestionario");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Efectos ---
    useEffect(() => {
        if (isOpen) {
            fetchAreasList();
            fetchQuestionary();
        }
    }, [isOpen, id]);

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
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Editar Cuestionario</h2>
                                <button
                                    className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    <FaXmark size={20} />
                                </button>
                            </div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">Área</label>
                                                <select
                                                    value={area}
                                                    onChange={(e) => setArea(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg
                                                    dark:bg-zinc-800 dark:text-zinc-100"
                                                >
                                                    <option value="">Seleccionar área</option>
                                                    {areasList.map((a) => (
                                                        <option key={a._id} value={a._id}>
                                                            {a.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">Fecha inicio</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">Fecha límite</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    min={today}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value < today) {
                                                            setMessage("La fecha límite no puede ser anterior a hoy");
                                                            setEndDate("");
                                                            return;
                                                        }
                                                        if (startDate && value < startDate) {
                                                            setMessage("La fecha límite no puede ser menor que la fecha de inicio");
                                                            setEndDate("");
                                                            return;
                                                        }
                                                        setMessage("");
                                                        setEndDate(value);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">Estado</label>
                                                <select
                                                    id="status"
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg
                                                    dark:bg-zinc-800 dark:text-zinc-100"
                                                >
                                                    <option value="en espera">En Espera</option>
                                                    <option value="activo">Activo</option>
                                                    <option value="cerrado">Cerrado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="flex w-full items-center justify-center gap-2 py-2 
                                        bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                                        transition-all duration-200 cursor-pointer
                                        hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                                        >
                                            Guardar
                                        </button>

                                        <div className="flex flex-col justify-center items-center">
                                            <p className="">{message}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}