
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import type { Worker } from "../types/workers";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./visuals/Spinner";
import { AddWorkersOnly } from "./questionary/AddWorkersOnly";
import { formatRut } from "../utills/formatRut";
import apiClient from "../config/apiClient";

interface ModalProps {
    id: string | null,
    isOpen: boolean;
    onClose: () => void
    onSave: () => void;
    setToast: React.Dispatch<
        React.SetStateAction<{ message: string; type: "success" | "error" } | null>
    >;
}

export function WorkerModal({ id, isOpen, onClose, onSave, setToast }: ModalProps) {

    const [worker, setWorker] = useState<Worker>({
        id: "",
        rut: "",
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        fechaIngreso: "",
        cumpleaños: "",
    });

    const [area, setArea] = useState("");
    const [areasList, setAreasList] = useState<{ _id: string, nombre: string }[]>([])
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false);

    const [mode, setMode] = useState('manual')

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            apiClient
                .get(`/workers/getById/${id}`)
                .then((res) => {
                    if (res.data.success) {
                        setWorker(res.data.worker);
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => setIsLoading(false));
        } else {
            setWorker({
                id: "",
                rut: "",
                nombres: "",
                apellido_paterno: "",
                apellido_materno: "",
                email: "",
                fechaIngreso: "",
                cumpleaños: "",
            });
        }
        fetchAreasList()
        setMessage("");
    }, [id]);

    const handleSave = async () => {
        if (!worker.rut.trim()) {
            setMessage("Este campo es obligatorio");
            return;
        }

        if (!worker.email.trim()) {
            setMessage("Este campo es obligatorio");
            return;
        }

        try {
            setIsLoading(true);
            if (id) {
                await apiClient.put(`/workers/update/${id}`, {
                    ...worker,
                    area_id: area
                });
            } else {
                await apiClient.post("/workers/add", {
                    ...worker,
                    area_id: area
                });
            }
            setWorker({
                id: "",
                rut: "",
                nombres: "",
                apellido_paterno: "",
                apellido_materno: "",
                email: "",
                fechaIngreso: "",
                cumpleaños: "",
            });
            setMessage("");
            onClose();
            onSave();
        } catch (err: any) {
            console.error("Error al guardar trabajador:", err);
            setMessage(err.response?.data?.error || "No se pudo guardar el trabajador");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAreasList = async () => {
        try {
            const res = await apiClient.get("/areas/getAll");
            setAreasList(res.data.areas);
        } catch (err) {
            console.error("Error al cargar áreas:", err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
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
                        <div className="flex flex-col gap-4">

                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">
                                    {id ? "Editar Trabajador" : "Agregar Trabajador"}
                                </h2>
                                <button
                                    className=" hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                    onClick={onClose}
                                >
                                    <FaXmark size={20} />
                                </button>

                            </div>

                            {!id && (
                                <div className="flex w-fit rounded-lg overflow-hidden 
                                    border border-gray-200 dark:border-zinc-600">
                                    <button
                                        type="button"
                                        onClick={() => setMode("manual")}
                                        className={`px-4 py-2 text-sm font-medium transition-all
                                                        ${mode === "manual"
                                                ? "bg-blue-600 text-white"
                                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            }`}
                                    >
                                        Normal
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMode("batch")}
                                        className={`px-4 py-2 text-sm font-medium transition-all
                                                        ${mode === "batch"
                                                ? "bg-blue-600 text-white"
                                                : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            }`}
                                    >
                                        Grupo
                                    </button>

                                </div>)}

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
                                    className="flex flex-col gap-4"
                                >

                                    {mode === "manual" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">RUT</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.rut}
                                                        maxLength={10}
                                                        onChange={e =>
                                                            setWorker(prev => ({
                                                                ...prev,
                                                                rut: formatRut(e.target.value)
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Nombres</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.nombres}
                                                        onChange={e => setWorker(prev => ({ ...prev, nombres: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Apellido Paterno</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.apellido_paterno}
                                                        onChange={e => setWorker(prev => ({ ...prev, apellido_paterno: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Apellido Materno</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.apellido_materno}
                                                        onChange={e => setWorker(prev => ({ ...prev, apellido_materno: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.email}
                                                        onChange={e => setWorker(prev => ({ ...prev, email: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Área</label>
                                                    <select
                                                        value={area}
                                                        onChange={(e) => setArea(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition
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

                                                <div className="flex flex-col">
                                                    <label className="mb-1  font-medium">Fecha de Ingreso</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.fechaIngreso}
                                                        onChange={e => setWorker(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <label className="mb-1 font-medium">Fecha de Nacimiento</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                                        value={worker.cumpleaños}
                                                        onChange={e => setWorker(prev => ({ ...prev, cumpleaños: e.target.value }))}
                                                    />
                                                </div>

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
                                            </button>

                                            <div className="flex flex-col justify-center items-center">
                                                <p className="text-gray-600 dark:text-gray-300">{message}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {mode === "batch" && (
                                        <AddWorkersOnly
                                            onWorkersAdded={onSave}
                                            setToast={setToast}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}