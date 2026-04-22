import { useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { SingleOption } from "../components/questionary/SingleOption"
import type { Pregunta } from "../types/questionary"

interface QuestionaryNormalProps {
    questions: Pregunta[]
    questionaryId?: string
    userId?: string
    startTime: number | null
    onEvaluated: (score: number, attempts: number | null) => void
}

export function QuestionaryNormal({
    questions,
    questionaryId,
    userId,
    startTime,
    onEvaluated
}: QuestionaryNormalProps) {

    const [selectedOptions, setSelectedOptions] =
        useState<{ [index: number]: string }>({})

    const [evaluated, setEvaluated] = useState(false)

    const allAnswered =
        questions.length > 0 &&
        questions.every((_, index) => selectedOptions[index])

    const handleEvalue = async () => {

        if (evaluated) return

        setEvaluated(true)

        const endTime = Date.now()
        const duration = startTime ? (endTime - startTime) / 1000 : null

        let s = 0

        const correctAnswers: { [index: number]: boolean } = {}
        const chosenAnswers: { [index: number]: string } = {}
        const chosenTexts: { [index: number]: string } = {}

        questions.forEach((p, index) => {

            const selected = selectedOptions[index]?.trim().toLowerCase()
            const correctAlt = p.alternativas.find(a => a.correcta)
            const correct = correctAlt?.opcion.trim().toLowerCase()

            const isCorrect = selected === correct

            correctAnswers[index] = isCorrect

            if (isCorrect) s++

            chosenAnswers[index] = selectedOptions[index] || ""

            const selectedAlt = p.alternativas.find(
                a => a.opcion.trim().toLowerCase() === selected
            )

            chosenTexts[index] = selectedAlt ? selectedAlt.texto : ""
        })

        try {

            const csrfToken = Cookies.get("csrf_access_token")

            const res = await axios.post(
                `http://localhost:5000/questions/submitRes/${questionaryId}`,
                {
                    trabajador_id: userId,
                    results: correctAnswers,
                    answers: chosenAnswers,
                    texts: chosenTexts,
                    duration
                },
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            )

            onEvaluated(s, res.data.intentos ?? null)

        } catch (err: any) {

            console.log("ERROR BACKEND:", err.response?.data)
            onEvaluated(s, null)
        }
    }

    return (
        <div className="flex flex-col gap-6">

            {questions.length > 0 ? (
                questions.map((question, index) => (
                    <div key={index} className="p-6 rounded-xl shadow-sm
                        border border-gray-200 dark:border-zinc-600
                        bg-white dark:bg-zinc-800">

                        <h1 className="text-xl font-semibold mb-3">
                            Pregunta {index + 1}
                        </h1>

                        <p className="text-lg mb-4">
                            {question.pregunta}
                        </p>

                        {question.alternativas.map((alt, i) => {

                            const isSelected =
                                selectedOptions[index] === alt.opcion

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
                                            [index]: alt.opcion
                                        }))
                                    }}
                                />
                            )
                        })}
                    </div>
                ))
            ) : (
                <p>No hay preguntas todavía.</p>
            )}

            {questions.length > 0 && (
                <button
                    onClick={handleEvalue}
                    disabled={!allAnswered || evaluated}
                    className={`mt-4 py-2 px-4 rounded-md font-semibold
                        ${allAnswered && !evaluated
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    Evaluar
                </button>
            )}
        </div>
    )
}