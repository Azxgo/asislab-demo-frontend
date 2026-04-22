import axios from "axios"
import Cookies from "js-cookie";
import { useState } from "react"
import { FaAngleDown, FaAngleUp, FaCheck } from "react-icons/fa"
import { FaPenToSquare } from "react-icons/fa6"
import type { Pregunta } from "../types/questionary";

type QuestionaryAnalyticsNormalProps = {
    id: string
    questions: Pregunta[]
    stats: { correctas: number; incorrectas: number }[]
    setQuestions: React.Dispatch<React.SetStateAction<Pregunta[]>>
    setToast: React.Dispatch<React.SetStateAction<{ message: string; type: "success" | "error" } | null>>
}

export function QuestionaryAnalyticsNormal({ id,
    questions,
    stats,
    setQuestions,
    setToast }: QuestionaryAnalyticsNormalProps) {

    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [SelectedQuestion, setSelectedQuestion] = useState<number | null>(null)

    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
    const [editingAlternativeIndex, setEditingAlternativeIndex] = useState<{ qIndex: number, aIndex: number } | null>(null)

    const handleOpenDetails = (id: number) => {
        if (SelectedQuestion === id && isDetailsOpen) {
            setIsDetailsOpen(false);
            setSelectedQuestion(null);
        } else {
            setSelectedQuestion(id);
            setIsDetailsOpen(true);
        }
    }


    const handleEditQuestion = async (qIndex: number) => {
        if (editingQuestionIndex !== null && editingQuestionIndex !== qIndex) {
            await handleSaveQuestion(editingQuestionIndex, questions[editingQuestionIndex].pregunta)
        }
        setEditingQuestionIndex(qIndex)
        setEditingAlternativeIndex(null)
    }

    const handleEditAlternative = async (qIndex: number, aIndex: number) => {
        if (editingAlternativeIndex !== null && (editingAlternativeIndex.qIndex !== qIndex || editingAlternativeIndex.aIndex !== aIndex)) {
            const alt = questions[editingAlternativeIndex.qIndex].alternativas[editingAlternativeIndex.aIndex]
            await handleSaveAlternative(editingAlternativeIndex.qIndex, editingAlternativeIndex.aIndex, alt.texto)
        }
        setEditingAlternativeIndex({ qIndex, aIndex })
        setEditingQuestionIndex(null)
    }

    const handleSaveQuestion = async (qIndex: number, newText: string) => {
        if (!id) return

        try {
            const csrfToken = Cookies.get("csrf_access_token");

            await axios.put(
                `http://localhost:5000/questions/edit_questions/${id}`,
                {
                    questionIndex: qIndex,
                    pregunta: newText
                },
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            )

            setQuestions(prev => prev.map((q, i) => i === qIndex ? { ...q, pregunta: newText } : q))

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

    const handleSaveAlternative = async (qIndex: number, aIndex: number, newText: string) => {
        if (!id) return
        try {
            const csrfToken = Cookies.get("csrf_access_token");
            await axios.put(
                `http://localhost:5000/questions/edit_alternative/${id}`,
                { questionIndex: qIndex, alternativeIndex: aIndex, alternativa: newText },
                { headers: { "X-CSRF-TOKEN": csrfToken }, withCredentials: true }
            )
            setQuestions(prev => {
                const newQuestions = [...prev]
                newQuestions[qIndex].alternativas[aIndex].texto = newText
                return newQuestions
            })
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

    return (
        <>
            {questions.map((question, qIndex) => {
                const correctas = stats[qIndex]?.correctas || 0
                const incorrectas = stats[qIndex]?.incorrectas || 0
                const max = Math.max(correctas, incorrectas, 1)

                return (
                    <div key={qIndex} className="my-2 border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold mb-1">Pregunta {qIndex + 1}</h2>
                            <button
                                className="flex items-center text-lg gap-2 cursor-pointer"
                                onClick={() => handleOpenDetails(qIndex)}
                            >
                                <p>Detalles </p>
                                {isDetailsOpen ? <FaAngleDown /> : <FaAngleUp />}

                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {editingQuestionIndex === qIndex ? (
                                <div className="flex w-full my-3 gap-3">
                                    <textarea
                                        value={question.pregunta}
                                        onChange={(e) =>
                                            setQuestions(prev =>
                                                prev.map((q, idx) => (idx === qIndex ? { ...q, pregunta: e.target.value } : q))
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
                                        onClick={() => handleSaveQuestion(qIndex, question.pregunta)}
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
                                        onClick={() => handleEditQuestion(qIndex)}
                                    >
                                        <FaPenToSquare size={22} />
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div
                                    className="h-6 rounded bg-green-500 transition duration-500"
                                    style={{ width: `${(correctas / max) * 65}%` }}
                                />
                                <span className="ml-3">{correctas}</span>
                            </div>
                            <div className="flex items-center">
                                <div
                                    className="h-6 rounded bg-red-500 transition duration-500"
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

                                                {editingAlternativeIndex?.qIndex === qIndex && editingAlternativeIndex?.aIndex === aIndex ? (
                                                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
                                                        <textarea
                                                            value={alternative.texto}
                                                            onChange={(e) =>
                                                                setQuestions(prev =>
                                                                    prev.map((q, idxQ) =>
                                                                        idxQ === qIndex
                                                                            ? {
                                                                                ...q,
                                                                                alternativas: q.alternativas.map((alt, idxA) =>
                                                                                    idxA === aIndex ? { ...alt, texto: e.target.value } : alt
                                                                                ),
                                                                            }
                                                                            : q
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
                                                            onClick={() => handleSaveAlternative(qIndex, aIndex, alternative.texto)}
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
                                                                onClick={() => handleEditAlternative(qIndex, aIndex)}
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
                    </div>
                )
            })}
        </>

    )
}