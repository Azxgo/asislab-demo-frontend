

import { AnimatePresence, motion } from "framer-motion";
import { Title } from "react-head";
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Modulo, Pregunta } from "../types/questionary"
import { FaUpRightFromSquare, FaLightbulb } from "react-icons/fa6";
import { WorkersList } from "../components/questionary/WorkersList"
import { AddWorkers } from "../components/questionary/AddWorkers";
import { Spinner } from "../components/visuals/Spinner";
import { Toast } from "../components/visuals/Toast";
import { LoadingDots } from "../components/visuals/LoadingDots";
import { getPercentageColor } from "../utills/getPercentColor";
import { QuestionaryButton } from "../components/questionary/QuestionaryButton";
import { QuestionaryAnalyticsNormal } from "./QuestionaryAnalyticsNormal";
import { QuestionaryAnalyticsModule, type ModuleStats } from "./QuestionaryAnalyticsModulo";
import { FaAngleDown, FaAngleUp, FaCheck } from "react-icons/fa";
import apiClient from "../config/apiClient";

type AnalyticsData = {
    fecha: string
    num_evs: number
    prom_puntaje: string
    prom_porcentaje: string
    prom_respondido: string
}
type QuestionStats = Record<
    string,
    {
        correctas: number
        incorrectas: number
    }
>


export default function QuestionaryAnalyticsPage() {
    const { id } = useParams<{ id: string }>()
    const [questions, setQuestions] = useState<Pregunta[] | Modulo[]>([])

    const [stats, setStats] = useState<
        QuestionStats | QuestionStats[]
    >({})

    const [moduleStats, setModuleStats] = useState<ModuleStats[]>([])

    const [name, setName] = useState("")
    const [area, setArea] = useState("")

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const [isGenerateOpen, setIsGenerateOpen] = useState(false)

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [tipo, setTipo] = useState<string>("normal")

    const [numQuestions, setNumQuestions] = useState<string>("5");
    const [bankQuestions, setBankQuestions] = useState<string>("10");

    const [error, setError] = useState("")
    const [loadingPage, setLoadingPage] = useState(true)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    console.log(stats)

    const fetchAnalytics = async () => {
        try {
            const response = await apiClient.get(
                `/questions/get_stats/${id}`,
                {

                }
            );
            const data = response.data
            setQuestions(data.preguntas)
            setStats(data.stats)
            setModuleStats(data.stats_modulos ?? [])
            setName(data.nombre)
            setAnalytics(data)
            setArea(data.area_id)
            setTipo(data.tipo)
        } catch (err) {
            console.error("Error al obtener los datos:", err)
            setError("No se pudieron obtener los datos")
        } finally {
            setLoadingPage(false)
        }
    }

    useEffect(() => {
        if (id) fetchAnalytics()
    }, [id])

    // Crea de nuevo las preguntas en base al texto
    const handleRegenerate = async () => {
        if (!id) return

        if (!numQuestions || isNaN(Number(numQuestions))) {
            setToast({
                message: "Ingresa un número válido de preguntas",
                type: "error",
            })
            return
        }

        if (!bankQuestions || isNaN(Number(bankQuestions))) {
            setToast({
                message: "Ingresa un número válido de preguntas",
                type: "error",
            })
            return
        }

        if (Number(numQuestions) > Number(bankQuestions)) {
            setToast({
                message: "Las preguntas mostradas no pueden ser mayores al banco de preguntas",
                type: "error",
            })
            return
        }

        try {
            setLoading(true)

            await apiClient.post(
                `/questions/regenerate/${id}`,
                {
                    num_q: numQuestions,
                    bank_q: bankQuestions,
                },
                {

                }
            );
            await fetchAnalytics()
            setToast({
                message: "Nuevas preguntas generadas",
                type: "success",
            });
        } catch (err) {
            setToast({
                message: "Error al generar nuevas preguntas",
                type: "error",
            });
        } finally {
            setLoading(false)
        }
    }

    const handleCloseModal = () => setIsModalOpen(false)
    const handleCloseAddModal = () => setIsAddModalOpen(false)

    return (
        <div className="flex flex-col rounded-lg min-h-50 p-4 sm:p-6 md:p-8 lg:p-8 
        border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[500px]">
            {loadingPage ? (
                <Spinner />
            ) : (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl sm:text-3xl font-bold">Estadísticas</h1>

                            <button
                                onClick={() => navigate(`/share/${id}`)}
                                className="cursor-pointer flex gap-2 px-4 py-2 rounded-md shadow-sm
                                 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  
                                 hover:shadow-md bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 
                                 transition-all duration-300 active:scale-95"
                            >
                                <FaUpRightFromSquare size={22} />
                                <p className="font-semibold">Compartir</p>
                            </button>
                        </div>

                        {/* Estadísticas */}
                        <div className="p-4 border border-gray-200 dark:border-zinc-600 rounded-xl">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                                Resumen
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p className="text-base sm:text-xl">Fecha creado: <span className="text-xs sm:text-xl font-medium">{analytics?.fecha && new Date(analytics.fecha).toLocaleString("es-CL")}</span></p>
                                <p className="text-base sm:text-xl">Número de participaciones: <span className="text-base sm:text-xl font-medium">{analytics?.num_evs}</span></p>
                                <p className="flex gap-2 text-base sm:text-xl">
                                    Puntuación Promedio:
                                    <div className="flex gap-2 items-center ">
                                        <span className="text-xs sm:text-xl font-medium">{analytics?.prom_puntaje}</span>
                                        <span className={` text-xs sm:text-xl font-medium ${getPercentageColor(analytics?.prom_porcentaje!)}`}>
                                            {analytics?.prom_porcentaje}%
                                        </span>
                                    </div>
                                </p>
                                <p className="text-base sm:text-xl">Porcentaje Completado: <span className="font-medium">{analytics?.prom_respondido}%</span></p>

                                <div className="flex text-xl">
                                    <QuestionaryButton
                                        onClick={() => setIsAddModalOpen(true)}
                                    >
                                        <p className="text-base sm:text-xl font-semibold">Gestionar participantes</p>
                                    </QuestionaryButton>
                                </div>
                                <div className="flex text-xl">
                                    <QuestionaryButton
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <p className="text-base sm:text-xl font-semibold">Puntuaciones individuales</p>
                                    </QuestionaryButton>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col p-4 border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 rounded-xl gap-2 ">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">Preguntas</h2>

                                <button
                                    onClick={() => setIsGenerateOpen(prev => !prev)}
                                    disabled={loading}
                                    className="flex cursor-pointer flex gap-2 px-4 py-2 rounded-md shadow-sm
                                 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  
                                 hover:shadow-md bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 
                                 transition-all duration-300 active:scale-95 items-center"
                                >
                                    <FaLightbulb size={22} />
                                    <p className=" hidden sm:block text-base sm:text-xl font-semibold">Generar Nuevas Preguntas</p>
                                    {isGenerateOpen ? <FaAngleDown /> : <FaAngleUp />}
                                </button>
                            </div>

                            <div className={`flex flex-col sm:flex-row bg-gray-100 dark:bg-zinc-700/30 p-2 gap-5 rounded-lg transition-[max-height,opacity,padding] duration-500 ease-in-out
                                 ${isGenerateOpen ? "max-h-[1500px] opacity-100 p-4" : "max-h-0 opacity-0 p-0"}
                                `}>
                                <div className="flex gap-2 w-full items-center">
                                    <label className=" font-medium  w-full">
                                        Preguntas mostradas
                                    </label>

                                    <input
                                        type="text"
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(e.target.value)}
                                        className="w-full px-4 py-1 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex gap-2 w-full items-center">
                                    <label className="font-medium text w-full">
                                        Banco de preguntas
                                    </label>

                                    <input
                                        type="text"
                                        value={bankQuestions}
                                        onChange={(e) => setBankQuestions(e.target.value)}
                                        className="w-full px-4 py-1 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="cursor-pointer flex gap-2 px-4 py-2 w-58 rounded-md shadow-sm
                                    border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100
                                    hover:shadow-md bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600
                                    transition-all duration-300 active:scale-95"
                                    onClick={handleRegenerate}
                                >
                                    {loading ? (
                                        <div className="flex gap-2 items-center">
                                            <div className="animate-spin border-2 border-zinc-400 border-t-transparent rounded-full w-4 h-4" />
                                            <LoadingDots className={"text-base text-gray-600 dark:text-gray-300"} isLoading={true} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2 items-center">
                                                <FaCheck size={16} />
                                                <span>Generar</span>
                                            </div>
                                        </>
                                    )}
                                </button>
                            </div>

                            {error ? (
                                <p className="text-center text-red-500">{error}</p>
                            ) : (
                                questions.length > 0 && Object.keys(stats).length > 0 ? (
                                    tipo === "modulo" ? (
                                        <QuestionaryAnalyticsModule
                                            id={id ?? ""}
                                            questions={questions as Modulo[]}
                                            setQuestions={setQuestions as React.Dispatch<React.SetStateAction<Modulo[]>>}
                                            stats={stats as Record<string, { correctas: number; incorrectas: number }>[]}
                                            moduleStats={moduleStats as ModuleStats[]}
                                            setToast={setToast}
                                        />
                                    ) : (
                                        <QuestionaryAnalyticsNormal
                                            id={id ?? ""}
                                            questions={questions as Pregunta[]}
                                            stats={stats as Record<string, { correctas: number; incorrectas: number }>}
                                            setQuestions={setQuestions as React.Dispatch<React.SetStateAction<Pregunta[]>>}
                                            setToast={setToast}
                                        />
                                    )
                                ) : (
                                    <p>No hay estadísticas</p>
                                )
                            )}
                        </div>
                    </motion.div>
                </>
            )}
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <WorkersList
                id={id ?? ""}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            <AddWorkers
                id={id ?? ""}
                area={area}
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
            />

            <Title>{`${name} - Estadísticas`}</Title>
        </div>
    )
}