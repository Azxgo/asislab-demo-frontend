import { useEffect, useState } from "react"
import { SingleOption } from "../components/questionary/SingleOption"
import type { Pregunta } from "../types/questionary"
import apiClient from "../config/apiClient"

interface QuestionaryNormalProps {
    questions: Pregunta[]
    numQuestions: number
    questionaryId?: string
    guestId?: string
    startTime: number | null
    onEvaluated: (score: number, attempts: number | null) => void
}

export function QuestionaryNormal({
    questions,
    numQuestions,
    questionaryId,
    guestId,
    startTime,
    onEvaluated
}: QuestionaryNormalProps) {

    const [selectedOptions, setSelectedOptions] =
        useState<{ [key: string]: string }>({})


    const [visibleQuestions, setVisibleQuestions] = useState<Pregunta[]>([])

    const [evaluated, setEvaluated] = useState(false)

    const allAnswered =
        visibleQuestions.length > 0 &&
        visibleQuestions.every((q,) => selectedOptions[q.id])

    const handleEvalue = async () => {

        if (evaluated) return

        setEvaluated(true)

        const endTime = Date.now()
        const duration = startTime ? (endTime - startTime) / 1000 : null

        let s = 0

        const correctAnswers: { [key: string]: boolean } = {}
        const chosenAnswers: { [key: string]: string } = {}
        const chosenTexts: { [key: string]: string } = {}

        visibleQuestions.forEach((p) => {
            const questionKey = p.id

            const selected = selectedOptions[questionKey]?.trim().toLowerCase()

            const correctAlt = p.alternativas.find(a => a.correcta)
            const correct = correctAlt?.opcion.trim().toLowerCase()

            const isCorrect = selected === correct

            correctAnswers[questionKey] = isCorrect

            if (isCorrect) s++

            chosenAnswers[questionKey] = selectedOptions[questionKey] || ""

            const selectedAlt = p.alternativas.find(
                a => a.opcion.trim().toLowerCase() === selected
            )

            chosenTexts[questionKey] = selectedAlt ? selectedAlt.texto : ""
        })

        try {


            const res = await apiClient.post(
                `/questions/submitRes/${questionaryId}`,
                {
                    trabajador_id: guestId,
                    results: correctAnswers,
                    answers: chosenAnswers,
                    texts: chosenTexts,
                    duration
                },
                {
  
                }
            )

            onEvaluated(s, res.data.intentos ?? null)

        } catch (err: any) {

            console.log("ERROR BACKEND:", err.response?.data)
            onEvaluated(s, null)
        }
    }


    const shuffleArray = <T,>(array: T[]) => {
        const arr = [...array]

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }

        return arr
    }

    useEffect(() => {
        const randomQuestions = shuffleArray(questions).slice(0, numQuestions)

        setVisibleQuestions(randomQuestions)
    }, [questions, numQuestions])

    return (
        <div className="flex flex-col gap-6">

            {visibleQuestions.length > 0 ? (
                visibleQuestions.map((question, index) => (
                    <div key={index} className="p-6 rounded-xl shadow-sm hover:shadow-md
                        border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                    >

                        <h1 className="text-xl sm:text-2xl font-semibold">
                            Pregunta {index + 1}
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl mt-2 mb-2">
                            {question.pregunta}
                        </p>
                        <div className="flex flex-col my-3">
                            {question.alternativas.map((alt, i) => {
                                const isSelected =
                                    selectedOptions[question.id] === alt.opcion
                                return (
                                    <SingleOption
                                        key={i}
                                        label={alt.opcion}
                                        text={alt.texto}
                                        selected={isSelected}
                                        onSelect={() => {
                                            if (evaluated) return

                                            setSelectedOptions(prev => ({
                                                ...prev,
                                                [question.id]: alt.opcion
                                            }))
                                        }}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ))
            ) : (
                <p>No hay preguntas todavía.</p>
            )}

            {visibleQuestions.length > 0 && (
                <button
                    onClick={handleEvalue}
                    disabled={!allAnswered || evaluated}
                    className={`mt-4 py-2 px-4 rounded-md font-semibold
                        ${allAnswered && !evaluated
                            ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    Evaluar
                </button>
            )}
        </div>
    )
}