import { useState } from "react";
import type { Modulo, Pregunta } from "../types/questionary"
import { FaAngleDown, FaAngleUp, FaCheck, FaLightbulb } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import Cookies from "js-cookie";
import axios from "axios";
import { LoadingDots } from "../components/visuals/LoadingDots";

export type ModuleStats = {
    modulo: string
    prom_puntaje: number
    prom_porcentaje: number
}

type QuestionaryAnalyticsModuleProps = {
    id: string,
    questions: Modulo[]
    stats: { correctas: number; incorrectas: number }[][]
    moduleStats: ModuleStats[]
    setQuestions: React.Dispatch<React.SetStateAction<Modulo[]>>
    setToast: React.Dispatch<React.SetStateAction<{ message: string; type: "success" | "error" } | null>>

}

export function QuestionaryAnalyticsModule({ id,
    questions,
    setQuestions,
    stats,
    moduleStats,
    setToast
}: QuestionaryAnalyticsModuleProps) {

    const [selectedModule, setSelectedModule] = useState<number | null>(null)

    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [SelectedQuestion, setSelectedQuestion] = useState<number | null>(null)

    const [editingQuestionIndex, setEditingQuestionIndex] = useState<{ mIndex: number, qIndex: number } | null>(null)
    const [editingAlternativeIndex, setEditingAlternativeIndex] = useState<{ mIndex: number, qIndex: number, aIndex: number } | null>(null)

    const [numQuestionsByModule, setNumQuestionsByModule] = useState<{ [key: number]: string }>({})
    const [loadingModule, setLoadingModule] = useState<number | null>(null)

    const [openGenerator, setOpenGenerator] = useState<number | null>(null);

    const handleOpenModule = (mId: number) => {
        setSelectedModule(prev => prev === mId ? null : mId)
    }

    const handleOpenDetails = (qId: number) => {
        if (SelectedQuestion === qId && isDetailsOpen) {
            setIsDetailsOpen(false);
            setSelectedQuestion(null);
        } else {
            setSelectedQuestion(qId);
            setIsDetailsOpen(true);
        }
    }

    const handleEditQuestion = (mIndex: number, qIndex: number) => {
        setEditingQuestionIndex({ mIndex, qIndex })
        setEditingAlternativeIndex(null)
    }
    const handleSaveQuestion = async (mIndex: number, qIndex: number, newText: string) => {
        if (!id) return

        try {
            const csrfToken = Cookies.get("csrf_access_token");

            await axios.put(
                `http://localhost:5000/questions/edit_questions/${id}`,
                {
                    moduleIndex: mIndex,
                    questionIndex: qIndex,
                    pregunta: newText
                },
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            )

            setQuestions(prev =>
                prev.map((mod, mIdx) =>
                    mIdx === mIndex
                        ? {
                            ...mod,
                            preguntas: mod.preguntas.map((q, qIdx) =>
                                qIdx === qIndex
                                    ? { ...q, pregunta: newText }
                                    : q
                            )
                        }
                        : mod
                )
            )
            setEditingQuestionIndex(null)
            setToast({
                message: "Pregunta Actualizada",
                type: "success",
            });
        } catch (err) {
            console.error(err)
            setToast({
                message: "Error al actualizar la pregunta",
                type: "error",
            });
        }
    }

    const handleEditAlternative = async (mIndex: number, qIndex: number, aIndex: number) => {

        if (editingAlternativeIndex &&
            (
                editingAlternativeIndex.mIndex !== mIndex ||
                editingAlternativeIndex.qIndex !== qIndex ||
                editingAlternativeIndex.aIndex !== aIndex
            )
        ) {
            const alt =
                questions[editingAlternativeIndex.mIndex]
                    .preguntas[editingAlternativeIndex.qIndex]
                    .alternativas[editingAlternativeIndex.aIndex]

            await handleSaveAlternative(
                editingAlternativeIndex.mIndex,
                editingAlternativeIndex.qIndex,
                editingAlternativeIndex.aIndex,
                alt.texto
            )
        }

        setEditingAlternativeIndex({ mIndex, qIndex, aIndex })
        setEditingQuestionIndex(null)
    }

    const handleSaveAlternative = async (mIndex: number, qIndex: number, aIndex: number, newText: string) => {
        if (!id) return
        try {
            const csrfToken = Cookies.get("csrf_access_token");
            await axios.put(
                `http://localhost:5000/questions/edit_alternative/${id}`,
                { moduleIndex: mIndex, questionIndex: qIndex, alternativeIndex: aIndex, alternativa: newText },
                { headers: { "X-CSRF-TOKEN": csrfToken }, withCredentials: true }
            )
            setQuestions(prev =>
                prev.map((mod, mIdx) =>
                    mIdx === mIndex
                        ? {
                            ...mod,
                            preguntas: mod.preguntas.map((q, qIdx) =>
                                qIdx === qIndex
                                    ? {
                                        ...q,
                                        alternativas: q.alternativas.map((alt, aIdx) =>
                                            aIdx === aIndex
                                                ? { ...alt, texto: newText }
                                                : alt
                                        )
                                    }
                                    : q
                            )
                        }
                        : mod
                )
            )
            setEditingAlternativeIndex(null)
            setToast({
                message: "Alternativa Actualizada",
                type: "success",
            });

        } catch (err) {
            console.error(err)
            setToast({
                message: "Error al guardar alternativa",
                type: "error",
            });
        }
    }

    const generateQuestionsModule = async (mIndex: number) => {
        if (!id) return

        const num = numQuestionsByModule[mIndex]

        if (!num || isNaN(Number(num))) {
            setToast({
                message: "Ingresa un número válido de preguntas",
                type: "error",
            })
            return
        }

        try {
            setLoadingModule(mIndex)
            const csrfToken = Cookies.get("csrf_access_token")

            const res = await axios.post(
                `http://localhost:5000/questions/regenerate_by_module/${id}/${mIndex}`,
                { num_questions: Number(num) },
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true
                }
            )

            const newModule = res.data.modulo

            if (!newModule || !newModule.preguntas) {
                throw new Error("Formato inválido del módulo")
            }

            setQuestions(prev => {
                const updated = [...prev]

                while (updated.length <= mIndex) {
                    updated.push(null as any)
                }

                updated[mIndex] = newModule
                return updated
            })

            setToast({
                message: "Módulo generado correctamente",
                type: "success"
            })
        } catch (err: any) {
            console.error("ERROR BACKEND:", err.response?.data)
            setToast({
                message: "Error al generar el módulo",
                type: "error"
            })
        } finally {
            setLoadingModule(null)
        }
    }

    return (
        <>
            {questions.map((modulo: Modulo, mIndex: number) => (
                <div key={mIndex} className="mb-2">
                    <div
                        className="flex gap-2 items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-600 
                        p-2 rounded-lg  transition-all duration-300 cursor-pointer"
                        onClick={() => handleOpenModule(mIndex)}
                    >
                        <div className="flex gap-2 ">
                            {selectedModule === mIndex
                                ? <FaAngleDown size={24} />
                                : <FaAngleUp size={24} />}
                            <h2

                                className="text-2xl font-bold select-none"
                            >
                                {modulo.modulo}

                            </h2>
                        </div>
                        <span className="flex gap-2 font-bold select-none">
                            <span>[{moduleStats[mIndex]?.prom_puntaje ?? 0} / {modulo.preguntas.length}]</span>
                            <span>{moduleStats[mIndex]?.prom_porcentaje ?? 0}%</span>
                        </span>
                    </div>

                    <div className={`overflow-hidden transition-[max-height,opacity,padding] duration-700
                        ease-in-out bg-gray-100 dark:bg-zinc-700/30 rounded-md 
                        ${selectedModule === mIndex ? "max-h-[1500px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <button
                                disabled={loadingModule === mIndex}
                                className="cursor-pointer flex gap-2 px-4 py-2 rounded-md shadow-sm
                            border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100
                            hover:shadow-md bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600
                            transition-all duration-300 active:scale-95"
                                onClick={() =>
                                    setOpenGenerator(prev => prev === mIndex ? null : mIndex)
                                }
                            >
                                <FaLightbulb size={18} />
                                <span className="font-medium">Generar</span>

                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-500
                                ${openGenerator === mIndex ? "max-h-40 opacity-100 " : "max-h-0 opacity-0"}`}
                            >
                                <div className="flex items-center gap-3">

                                    <label htmlFor="">Num Preguntas</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={numQuestionsByModule[mIndex] || ""}
                                        onChange={(e) =>
                                            setNumQuestionsByModule(prev => ({
                                                ...prev,
                                                [mIndex]: e.target.value
                                            }))
                                        }
                                        className="w-16 px-3 py-1.5 border border-gray-200 dark:border-zinc-400 rounded-lg outline-none"
                                    />

                                    <button
                                        disabled={loadingModule === mIndex}
                                        className="cursor-pointer flex gap-2 px-4 py-2 rounded-md shadow-sm
                                        border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100
                                        hover:shadow-md bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600
                                        transition-all duration-300 active:scale-95"
                                        onClick={() => generateQuestionsModule(mIndex)}
                                    >
                                        {loadingModule === mIndex
                                            ? <LoadingDots isLoading={true} />
                                            : <FaCheck size={16} />}
                                    </button>



                                </div>
                            </div>
                        </div>
                        {modulo.preguntas.map((question: Pregunta, qIndex: number) => {
                            const correctas = stats[mIndex]?.[qIndex]?.correctas || 0
                            const incorrectas = stats[mIndex]?.[qIndex]?.incorrectas || 0
                            const max = Math.max(correctas, incorrectas, 1)

                            return (
                                <div key={qIndex} className="my-2 border rounded-lg p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold mb-2">
                                            Pregunta {qIndex + 1}
                                        </h3>
                                        <button
                                            onClick={() => handleOpenDetails(qIndex)}
                                            className="flex items-center text-lg gap-2 cursor-pointer"
                                        >
                                            <p>Detalles </p>
                                            {isDetailsOpen ? <FaAngleDown /> : <FaAngleUp />}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {editingQuestionIndex?.mIndex === mIndex &&
                                            editingQuestionIndex?.qIndex === qIndex ? (
                                            <div className="flex w-full my-3 gap-3">
                                                <textarea
                                                    value={question.pregunta}
                                                    onChange={(e) =>
                                                        setQuestions(prev =>
                                                            prev.map((mod, mIdx) =>
                                                                mIdx === mIndex
                                                                    ? {
                                                                        ...mod,
                                                                        preguntas: mod.preguntas.map((q, qIdx) =>
                                                                            qIdx === qIndex
                                                                                ? { ...q, pregunta: e.target.value }
                                                                                : q
                                                                        )
                                                                    }
                                                                    : mod
                                                            )
                                                        )
                                                    }

                                                    onInput={(e) => {
                                                        const t = e.currentTarget;
                                                        t.style.height = "auto";
                                                        t.style.height = `${t.scrollHeight}px`;
                                                    }}

                                                    onFocus={(e) => {
                                                        const t = e.currentTarget;
                                                        t.style.height = "auto";
                                                        t.style.height = `${t.scrollHeight}px`;
                                                    }}
                                                    rows={1}
                                                    autoFocus
                                                    className="border border-gray-400 rounded-md px-2 py-1 text-xl outline-none resize-none w-full max-h-72 overflow-auto"
                                                />
                                                <button
                                                    onClick={() => handleSaveQuestion(mIndex, qIndex, question.pregunta)}
                                                    className="cursor-pointer transition text-gray-500 transform hover:text-gray-400"
                                                >
                                                    <FaCheck size={22} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 w-full">
                                                <p className="my-3 text-xl break-words">{question.pregunta}</p>
                                                <button
                                                    className="cursor-pointer transition text-gray-500 transform hover:text-gray-400"
                                                    onClick={() => handleEditQuestion(mIndex, qIndex)}
                                                >
                                                    <FaPenToSquare size={22} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="h-6 rounded bg-green-500"
                                            style={{ width: `${(correctas / max) * 65}%` }}
                                        />
                                        <span className="ml-3">{correctas}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className="h-6 rounded bg-red-500"
                                            style={{ width: `${(incorrectas / max) * 65}%` }}
                                        />
                                        <span className="ml-3">{incorrectas}</span>
                                    </div>

                                    <div
                                        className={`overflow-hidden transition-[max-height,opacity,padding] duration-600 ease-in-out bg-gray-100 dark:bg-zinc-700/30 rounded-md
                                            ${isDetailsOpen && SelectedQuestion === qIndex ? "max-h-[1000px] opacity-100 p-2" : "max-h-0 opacity-0 p-0"}`}
                                    >
                                        {question.alternativas.map((alternative, aIndex) => {
                                            const maxCont = Math.max(...question.alternativas.map((alt) => alt.contador ?? 0), 1)

                                            return (
                                                <div key={aIndex} className="flex flex-col gap-2 p-2">
                                                    <div className="flex gap-3 items-center group relative">
                                                        <span>{alternative.correcta ? "✅" : "❌"}</span>
                                                        <span>{`${alternative.opcion})`}</span>

                                                        {editingAlternativeIndex?.mIndex === mIndex && editingAlternativeIndex?.qIndex === qIndex && editingAlternativeIndex?.aIndex === aIndex ? (
                                                            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
                                                                <textarea
                                                                    value={alternative.texto}
                                                                    onChange={(e) =>
                                                                        setQuestions(prev =>
                                                                            prev.map((mod, mIdx) =>
                                                                                mIdx === mIndex
                                                                                    ? {
                                                                                        ...mod,
                                                                                        preguntas: mod.preguntas.map((q, qIdx) =>
                                                                                            qIdx === qIndex
                                                                                                ? {
                                                                                                    ...q,
                                                                                                    alternativas: q.alternativas.map((alt, aIdx) =>
                                                                                                        aIdx === aIndex
                                                                                                            ? { ...alt, texto: e.target.value }
                                                                                                            : alt
                                                                                                    )
                                                                                                }
                                                                                                : q
                                                                                        )
                                                                                    }
                                                                                    : mod
                                                                            )
                                                                        )
                                                                    }
                                                                    onInput={(e) => {
                                                                        const t = e.currentTarget;
                                                                        t.style.height = "auto";
                                                                        t.style.height = `${t.scrollHeight}px`;
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const t = e.currentTarget;
                                                                        t.style.height = "auto";
                                                                        t.style.height = `${t.scrollHeight}px`;
                                                                    }}
                                                                    rows={1}
                                                                    autoFocus
                                                                    className="border border-gray-400 rounded-md px-2 py-1 text-md outline-none resize-none w-full max-h-72 overflow-auto"
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveAlternative(mIndex, qIndex, aIndex, alternative.texto)}
                                                                    className="cursor-pointer transition text-gray-500 transform hover:text-gray-400"
                                                                >
                                                                    <FaCheck size={22} />
                                                                </button>
                                                            </div>
                                                        )
                                                            :
                                                            (
                                                                <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                                                                    <h1 className="break-words">{alternative.texto}</h1>
                                                                    <button
                                                                        onClick={() => handleEditAlternative(mIndex, qIndex, aIndex)}
                                                                        className="transition-opacity opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer transition text-gray-500 transform hover:text-gray-400"
                                                                    >
                                                                        <FaPenToSquare size={22} />
                                                                    </button>
                                                                </div>
                                                            )
                                                        }
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-4 rounded bg-blue-500 transition-all duration-500"
                                                            style={{ width: `${((alternative.contador ?? 0) / maxCont) * 65}%` }}
                                                        />
                                                        <span className="text-sm">{alternative.contador ?? 0}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </>
    )
}