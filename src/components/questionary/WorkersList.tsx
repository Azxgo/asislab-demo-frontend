import axios from "axios";
import { useEffect, useState } from "react";
import { FaAngleUp, FaAngleDown, FaXmark } from "react-icons/fa6";
import { Spinner } from "../visuals/Spinner";
import { AnimatePresence, motion } from "framer-motion"
import { formatSeconds } from "../../utills/formatSeconds";

interface WorkersListProps {
    id: string;
    isOpen: boolean;
    onClose: () => void
}

export function WorkersList({ id, isOpen, onClose }: WorkersListProps) {
    // Estado para guardar trabajadores
    const [workers, setWorkers] = useState<any[]>([])
    const [tipo, setTipo] = useState<string>("")

    const [openModule, setOpenModule] = useState<string | null>(null);

    // Estados para abrir detalles
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedWorker, setSelectedWorker] = useState<number | null>(null)

    const [loading, setLoading] = useState(true)

    // Función que llama las estadisticas por id
    const fetchWorkers = async (id: string) => {
        try {
            const res = await axios.get(`http://localhost:5000/questions/get_stats_by_workers/${id}`)
            setWorkers(res.data.stats)
            setTipo(res.data.type)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) fetchWorkers(id)
    }, [isOpen, id])

    // Función que abre menu despegable w¿de detalles
    const handleOpenDetails = (id: number) => {
        if (selectedWorker === id && isDetailsOpen) {
            setIsDetailsOpen(false);
            setSelectedWorker(null);

        } else {
            setSelectedWorker(id)
            setIsDetailsOpen(true)

        }
    }

    const groupByModule = (answers: any[]) => {
        const grouped: Record<number, any[]> = {}

        answers.forEach((r) => {
            const mIndex = r.module_index ?? 0
            if (!grouped[mIndex]) grouped[mIndex] = []
            grouped[mIndex].push(r)
        })

        return grouped
    }

    const toggleModule = (key: string) => {
        setOpenModule(prev => (prev === key ? null : key));
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold mb-4">Lista de evaluaciones</h2>
                            <button
                                className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                onClick={onClose}
                            >
                                <FaXmark size={20} />
                            </button>
                        </div>
                        {loading ? (
                            <Spinner />
                        ) :
                            workers.length === 0 ? (
                                <p className="text-center py-8">No hay evaluaciones disponibles.</p>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-zinc-600">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 rounded-md">
                                            <thead>
                                                <tr className="text-left">
                                                    <th className="px-4 py-1 text-left font-medium tracking-wider">Nombre</th>
                                                    <th className="px-4 py-1 text-left font-medium tracking-wider">Puntuación</th>
                                                    <th className="px-4 py-1 text-left font-medium tracking-wider">Fecha de respuesta</th>
                                                    <th className="px-4 py-1 text-left font-medium tracking-wider">Tiempo empleado</th>
                                                    <th className="px-4 py-1 text-left font-medium tracking-wider"></th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                                {workers.map((worker, i) => (
                                                    <>
                                                        <tr key={i} className="text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors duration-200">
                                                            <td className={`px-4 py-1 font-medium ${worker.peligro && worker.respondido ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-zinc-100"}`}>
                                                                {worker.trabajador}
                                                            </td>
                                                            <td className="px-4 py-1 font-medium ">{worker.score}</td>
                                                            <td className="px-4 py-1 font-medium ">
                                                                {worker.fecha_respondido && worker.fecha_respondido.$date
                                                                    ? new Date(worker.fecha_respondido.$date).toLocaleString()
                                                                    : (typeof worker.date === "string" ? worker.date : "Pendiente")}
                                                            </td>
                                                            <td className="px-4 py-1 font-medium">
                                                                {worker.duration != null ? formatSeconds(worker.duration) : "0"}
                                                            </td>
                                                            <td className="px-4 py-1 font-medium hover:text-gray-500 hover:text-zinc-200">
                                                                <button className="flex items-center cursor-pointer gap-2" onClick={() => handleOpenDetails(i)}>
                                                                    <p>Detalles</p>
                                                                    {isDetailsOpen && selectedWorker === i ? <FaAngleDown /> : <FaAngleUp />}
                                                                </button>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td colSpan={5} className="p-0">
                                                                <div
                                                                    className={`overflow-hidden transition-[max-height,opacity,padding] duration-500 ease-in-out bg-gray-100 dark:bg-zinc-900 rounded-b-md
                                                                    ${isDetailsOpen && selectedWorker === i ? "max-h-[1500px] opacity-100 p-4" : "max-h-0 opacity-0 p-0"}`}
                                                                >
                                                                    <h1 className="font-semibold mb-2">Resultados:</h1>
                                                                    {worker.respuestas_detalladas.length === 0 ? (
                                                                        <p className=" italic">No hay resultados disponibles.</p>
                                                                    ) : tipo === "modulo" ? (
                                                                        Object.entries(groupByModule(worker.respuestas_detalladas))
                                                                            .sort(([a], [b]) => Number(a) - Number(b))
                                                                            .map(([moduleIndex, preguntas]: any) => {

                                                                                const moduleName = preguntas[0]?.modulo ||
                                                                                    `Modulo ${Number(moduleIndex) + 1}`;

                                                                                const isOpen = openModule === moduleIndex;

                                                                                return (
                                                                                    <div key={moduleIndex} className="">
                                                                                        <div
                                                                                            className="flex items-center gap-2 cursor-pointer bg-gray-200 dark:bg-zinc-700 p-2 rounded-md"

                                                                                            onClick={() => toggleModule(moduleIndex)}
                                                                                        >
                                                                                            {isOpen ? <FaAngleDown /> : <FaAngleUp />}
                                                                                            <h3 className="font-bold text-lg">
                                                                                                {moduleName}
                                                                                            </h3>
                                                                                        </div>


                                                                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out
                                                                                            ${isOpen ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                                                                                            <div className="mt-2 space-x-2">
                                                                                                {preguntas.sort((a: any, b: any) =>
                                                                                                    a.question_index - b.question_index
                                                                                                )
                                                                                                    .map((r: any, idx: number) => (
                                                                                                        <div
                                                                                                            key={idx}
                                                                                                            className="p-4 bg-white dark:bg-zinc-800 rounded-md border"
                                                                                                        >
                                                                                                            <p className="font-semibold">
                                                                                                                Pregunta {r.question_index + 1}: Pregunta
                                                                                                            </p>
                                                                                                            <p>Opción elegida: {r.opcion_elegida}</p>
                                                                                                            <p>Alternativa: {r.texto_elegido}</p>

                                                                                                            <p className={`font-semibold mt-2 ${r.correcta
                                                                                                                ? "text-green-600"
                                                                                                                : "text-red-600"
                                                                                                                }`}>
                                                                                                                {r.correcta
                                                                                                                    ? "Correcta ✅"
                                                                                                                    : "Incorrecta ❌"}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    ))
                                                                                                }
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>
                                                                                )
                                                                            })
                                                                    ) :
                                                                        (
                                                                            <ul className="list-disc pl-5">
                                                                                {worker.respuestas_detalladas.map((r: any, i: any) => (
                                                                                    <li
                                                                                        key={i}
                                                                                        className="p-4 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-200 dark:border-zinc-600"
                                                                                    >
                                                                                        <p className="font-semibold mb-2">
                                                                                            Pregunta {r.index}: {r.pregunta}
                                                                                        </p>
                                                                                        <p className="">
                                                                                            <span className="font-medium">Opción elegida:</span> {r.opcion_elegida}
                                                                                        </p>
                                                                                        <p className="">
                                                                                            <span className="font-medium">Alternativa:</span> {r.texto_elegido}
                                                                                        </p>
                                                                                        <p className={`font-semibold mt-2 ${r.correcta ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                                                                                            Resultado: {r.correcta ? "Correcta ✅" : "Incorrecta ❌"}
                                                                                        </p>
                                                                                    </li>
                                                                                )
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}