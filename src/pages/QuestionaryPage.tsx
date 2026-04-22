import axios from "axios"
import type { Modulo, Pregunta, Talk } from "../types/questionary"
import { motion } from "framer-motion";
import { Title } from "react-head";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"
import { Presentation } from "../components/Presentation"
import { Spinner } from "../components/visuals/Spinner"
import { QuestionaryNormal } from "./QuestionaryNormal";
import { QuestionaryModulo } from "./QuestionaryModulo";
import { FaCheck, FaClock, FaArrowLeft, FaLock } from "react-icons/fa";
import { MyPresentation } from "../components/MyPresentation";

export default function QuestionaryPage() {
    // Id del cuestionario
    const { id } = useParams<{ id: string }>()
    // Datos del usuario iniciado
    const { user } = useAuthContext()
    // Preguntas
    const [questions, setQuestions] = useState<Pregunta[] | Modulo[]>([]);
    // Charla
    const [talk, setTalk] = useState("")
    const [talks, setTalks] = useState<Talk[]>([])
    // Nombre del cuestionario
    const [nombre, setNombre] = useState("")
    const [type, setType] = useState("")

    const [selectedModule, setSelectedModule] = useState<number | null>(null)
    const [currentTalkIndex, setCurrentTalkIndex] = useState<number | null>(null)

    const [slidesModules, setSlidesModules] = useState<any[]>([])

    const [score, setScore] = useState<number | null>(null)
    const [scoreByModule, setScoreByModulo] = useState<number[]>([])
    const [completedModules, setCompletedModules] = useState<number[]>([])

    const [startTime, setStartTime] = useState<number | null>(null);

    type Step = "index" | "presentation" | "questions" | "moduleResults" | "finalResults";
    const [step, setStep] = useState<Step>("index");

    const [attempts, setAttempts] = useState<number | null>(null);
    const [moduleAttempts, setModuleAttempts] = useState<Record<string, number>>({})
    const MAX_ATTEMPTS = 3;

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchQuestionary = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/questions/get/${id}`,
                    { withCredentials: true }
                )
                const cuestionario = res.data.cuestionario

                setNombre(cuestionario.nombre)
                setType(cuestionario.tipo ?? "")

                if (cuestionario.tipo === "modulo") {
                    setStep("index")
                } else {
                    setStep("presentation")
                }

                setTalk(cuestionario.talk)
                setTalks(cuestionario.talks ?? [])

                setSlidesModules(cuestionario.slides_modules ?? [])

                setQuestions(
                    Array.isArray(cuestionario.preguntas)
                        ? cuestionario.preguntas
                        : []
                )

                if (user) {
                    const evalUser = cuestionario.evaluaciones?.find(
                        (ev: any) => ev.trabajador_id === user.id
                    )

                    if (evalUser) {
                        setAttempts(evalUser.intentos ?? 0)
                        setCompletedModules(evalUser.completed_modules ?? [])
                        setModuleAttempts(evalUser.module_attempts ?? {})
                    } else {
                        setAttempts(evalUser ? evalUser.intentos : 0)
                    }

                } else {
                    setAttempts(0)
                }

            } catch (err: any) {
                console.error("Error al obtener el cuestionario:", err)
                setError("No se pudo cargar el cuestionario.")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchQuestionary()
    }, [id])

    useEffect(() => {
        if (type === "modulo") {
            const modulos = questions as Modulo[]
            setScoreByModulo(new Array(modulos.length).fill(0))
        }
    }, [questions])

    const isModuleUnlocked = (index: number) => {
        if (user?.rol === "administrador") return true

        if (isAllLocked) return false

        const attempts = moduleAttempts[index] ?? 0
        if (attempts >= MAX_ATTEMPTS) return false

        if (index === 0) return true
        return completedModules.includes(index - 1)
    }

    const currentSlidesModule = slidesModules.find(
        (m) => m.text.modulo === (currentTalkIndex ?? 0) + 1
    )

    const isAllLocked = Object.values(moduleAttempts).some(
        (att) => att >= MAX_ATTEMPTS
    )

    const isLastModule =
        (selectedModule ?? 0) === (questions as Modulo[]).length - 1

    const totalQuestions =
        type === "modulo"
            ? (questions as Modulo[]).reduce(
                (acc, mod) => acc + mod.preguntas.length,
                0
            )
            : (questions as Pregunta[]).length

    const currentTalk = talks.find(t => t.modulo === (currentTalkIndex ?? 0) + 1)

    const showBackButton =
        (step === "presentation" && type === "modulo") ||
        step === "moduleResults" ||
        step === "finalResults"

    return (
        <div className="flex flex-col rounded-lg min-h-50 p-4 sm:p-6 md:p-8 lg:p-8
        border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[500px]">
            {error && (
                <div className="flex items-center justify-center min-h-[200px]">
                    <p className="text-red-500 text-center font-medium">
                        {error}
                    </p>
                </div>
            )}
            {loading ? (
                <Spinner />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {showBackButton && (
                        <button
                            onClick={() => setStep("index")}
                            className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600"
                        >
                            <FaArrowLeft />
                            Volver al indice
                        </button>
                    )}

                    {step === "index" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >

                            {type === "modulo" && (
                                <div className="flex flex-col">
                                    <h1 className="text-4xl font-extrabold mb-6">{nombre}</h1>
                                    <div className="border border-gray-300 dark:border-zinc-600 p-2 rounded-lg">
                                        {talks.map((t, index) => {
                                            const unlocked = isModuleUnlocked(index)

                                            return (
                                                <>
                                                    <div
                                                        key={index}
                                                        className="mb-2"
                                                    >
                                                        <div className={`flex gap-2 items-center justify-between p-2
                                                        rounded-lg transition duration-200
                                                        ${unlocked
                                                                ? "hover:bg-gray-100 dark:hover:bg-zinc-600"
                                                                : "bg-gray-200 dark:bg-zinc-700 opacity-60 cursor-not-allowed"
                                                            }`}
                                                            onClick={() => {
                                                                if (!isModuleUnlocked(index)) return

                                                                setCurrentTalkIndex(index)
                                                                setStep("presentation")

                                                                window.scrollTo({
                                                                    top: 0,
                                                                    behavior: "smooth"
                                                                })
                                                            }}
                                                        >
                                                            <div className="flex gap-2 items-center">
                                                                <h1 className="text-2xl font-bold select-none">{t.nombre}</h1>
                                                            </div>
                                                            <span
                                                                className={`text-xs font-semibold px-3 py-1 rounded-full w-28
                                                            ${completedModules.includes(index)
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                                        : "bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300"
                                                                    }`}
                                                            >
                                                                {completedModules.includes(index)
                                                                    ? <div className="flex gap-2 items-center">
                                                                        <FaCheck />
                                                                        Completado
                                                                    </div>
                                                                    : unlocked
                                                                        ? <div className="flex gap-2 items-center">
                                                                            <FaClock />
                                                                            Pendiente
                                                                        </div>
                                                                        : <div className="flex gap-2 items-center">
                                                                            <FaLock />
                                                                            Bloqueado
                                                                        </div>
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}

                    {step === "presentation" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {type === "modulo" ? (
                                currentTalk && (
                                    <div>
                                        <h1 className="text-3xl font-bold mb-4">
                                            Modulo: {currentTalk.nombre}
                                        </h1>


                                        <MyPresentation slides={currentSlidesModule?.slides ?? []} />

                                        <button
                                            onClick={() => {
                                                setSelectedModule(currentTalkIndex)
                                                setStep("questions")
                                                setStartTime(Date.now())
                                                setScore(null)

                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth"
                                                })
                                            }}
                                            disabled={attempts !== null && attempts >= MAX_ATTEMPTS}
                                            className={`mt-4 text-white font-semibold py-2 px-4 rounded-md
                                            ${attempts !== null && attempts >= MAX_ATTEMPTS
                                                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                                                    : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer"
                                                }`}
                                        >
                                            Comenzar cuestionario
                                        </button>
                                    </div>
                                )
                            ) : (
                                talk ? (
                                    <>
                                        <Presentation talk={talk} />
                                        <button
                                            onClick={() => {
                                                setStep("questions");
                                                setStartTime(Date.now())
                                                setScore(null)
                                            }}
                                            disabled={attempts !== null && attempts >= MAX_ATTEMPTS}
                                            className={`mt-4 text-white font-semibold py-2 px-4 rounded-md
                                            ${attempts !== null && attempts >= MAX_ATTEMPTS
                                                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                                                    : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer"
                                                }`}
                                        >
                                            Comenzar cuestionario
                                        </button>
                                    </>
                                ) :
                                    questions.length === 0 ? (
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            <p className="text-red-500 text-center font-medium">
                                                No hay charla ni preguntas disponibles por ahora.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[200px]">
                                            <p className="text-red-500 text-center font-medium">
                                                No hay charla disponible por ahora.
                                            </p>
                                        </div>

                                    )
                            )}
                        </motion.div>

                    )}

                    {step === "questions" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-extrabold mb-6">{nombre}</h1>

                            {type === "modulo" ?
                                (
                                    <QuestionaryModulo
                                        questions={questions as Modulo[]}
                                        questionaryId={id}
                                        userId={user?.id}
                                        startTime={startTime}
                                        initialModule={selectedModule ?? 0}
                                        moduleScores={scoreByModule}
                                        setModuleScores={setScoreByModulo}
                                        onNextModule={(nextIndex) => {
                                            setCurrentTalkIndex(nextIndex)
                                            setSelectedModule(nextIndex)
                                            setStep("presentation")
                                        }}
                                        onEvaluated={(score, attempts, moduleScores, newModuleAttempts) => {
                                            setScore(score)
                                            setScoreByModulo(moduleScores)
                                            if (attempts !== null) setAttempts(attempts)

                                            if (newModuleAttempts) {
                                                setModuleAttempts(newModuleAttempts)
                                            }
                                            setStep("moduleResults")
                                        }}
                                        setCompletedModules={setCompletedModules}   // 👈 agrega esto

                                    />
                                )
                                :
                                (
                                    <QuestionaryNormal
                                        questions={questions as Pregunta[]}
                                        questionaryId={id}
                                        userId={user?.id}
                                        startTime={startTime}
                                        onEvaluated={(score, attempts) => {
                                            setScore(score)
                                            if (attempts !== null) setAttempts(attempts)
                                            setStep("finalResults")
                                        }}
                                    />
                                )
                            }

                        </motion.div>
                    )}

                    {step === "moduleResults" && selectedModule !== null && (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="mt-5 w-full max-w-lg bg-white dark:bg-zinc-800 p-6 text-center"
                            >
                                <h2 className="text-xl font-bold mb-4">
                                    Resultado del modulo
                                </h2>

                                {(() => {
                                    const mod = (questions as Modulo[])[selectedModule]
                                    const totalQ = mod.preguntas.length
                                    const scoreModule = scoreByModule[selectedModule] ?? 0
                                    const percentage = totalQ > 0
                                        ? (scoreModule / totalQ) * 100
                                        : 0

                                    return (
                                        <div className="flex flex-col w-full py-4 px-10 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                                            <h3 className="font-bold text-lg mb-3">
                                                {mod.modulo}
                                            </h3>

                                            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                                <div
                                                    className={`h-4 rounded-full 
                                                        ${scoreModule / totalQ > 0.7
                                                            ? "bg-green-500"
                                                            : scoreModule / totalQ >= 0.4
                                                                ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${(scoreModule / totalQ) * 100}%` }}
                                                />
                                            </div>

                                            <div>
                                                <p className=" text-lg font-semibold">
                                                    Tu puntuación: {scoreModule} / {totalQ}
                                                </p>
                                                <p className="mt-4 text-lg font-semibold">
                                                    {percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })()}

                                <div className="mt-6 flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setSelectedModule(currentTalkIndex)
                                            setStep("questions")
                                        }}
                                        disabled={
                                            selectedModule !== null &&
                                            (moduleAttempts[String(selectedModule)] ?? 0) >= MAX_ATTEMPTS
                                        }
                                        className={`text-white font-semibold py-2 px-4 rounded-md w-55
                                            ${selectedModule !== null && (moduleAttempts[String(selectedModule)] ?? 0) >= MAX_ATTEMPTS
                                                ? "bg-gray-400 cursor-not-allowed opacity-60"
                                                : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer"
                                            }`}
                                    >
                                        Reintentar
                                    </button>

                                    <button
                                        className="text-white font-semibold py-2 px-4 rounded-md w-55
                                        bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer"
                                        onClick={() => {
                                            const next = (selectedModule ?? 0) + 1
                                            const totalModules = (questions as Modulo[]).length

                                            if (next < totalModules) {
                                                setSelectedModule(next)
                                                setCurrentTalkIndex(next)
                                                setStep("presentation")
                                            } else {
                                                setStep("finalResults")
                                            }
                                        }}
                                    >
                                        {isLastModule ? "Ver resultados finales" : "Siguiente módulo"}
                                    </button>
                                </div>

                                <div className="mt-4 text-center font-medium">
                                    Intentos restantes: {
                                        MAX_ATTEMPTS - (moduleAttempts[selectedModule ?? 0] ?? 0)
                                    } de {MAX_ATTEMPTS}
                                </div>

                            </motion.div>
                        </div>
                    )
                    }

                    {
                        step === "finalResults" && score !== null && (
                            <div className="flex items-center justify-center min-h-[500px]">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="mt-5 w-full max-w-lg bg-white dark:bg-zinc-800 p-6 text-center "
                                >
                                    <h2 className="text-xl font-bold mb-2">
                                        Resultados del cuestionario
                                    </h2>

                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                        <div
                                            className={`h-4 rounded-full 
                                    ${score / totalQuestions > 0.7
                                                    ? "bg-green-500"
                                                    : score / totalQuestions >= 0.4
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                }`}
                                            style={{ width: `${(score / totalQuestions) * 100}%` }}
                                        />
                                    </div>

                                    <div>
                                        <p className="mt-4 text-lg font-semibold">
                                            Tu puntuación: {score} / {totalQuestions}
                                        </p>
                                        <p className="mt-4 text-lg font-semibold">
                                            {((score / totalQuestions) * 100).toFixed(1)}%
                                        </p>
                                    </div>

                                    {type === "modulo" && (
                                        <div className="mt-6 space-y-4">
                                            {(questions as Modulo[]).map((mod, index) => {
                                                const totalQ = mod.preguntas.length
                                                const scoreModule = scoreByModule[index] ?? 0
                                                const percentage =
                                                    totalQ > 0
                                                        ? (scoreModule / totalQ) * 100
                                                        : 0


                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col w-full py-4 px-10 bg-gray-100 dark:bg-zinc-700 rounded-lg"
                                                    >
                                                        <h3 className="font-bold mb-1">
                                                            {mod.modulo}
                                                        </h3>

                                                        <p>
                                                            {scoreModule} / {totalQ} (
                                                            {percentage.toFixed(1)}%
                                                            )
                                                        </p>

                                                        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                                                            <div
                                                                className={`h-2 rounded-full 
                                                                         ${percentage > 70
                                                                        ? "bg-green-500"
                                                                        : percentage >= 40
                                                                            ? "bg-yellow-500"
                                                                            : "bg-red-500"
                                                                    }`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>

                                                    </div>
                                                )
                                            })}

                                        </div>
                                    )}

                                </motion.div>
                            </div>
                        )
                    }
                </motion.div >
            )}
            <Title>{`${nombre} - Cuestionario`}</Title>
        </div >
    )
}