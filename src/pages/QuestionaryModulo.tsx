import { useEffect, useState } from "react"
import type { Modulo } from "../types/questionary"
import { SingleOption } from "../components/questionary/SingleOption"
import { motion } from "framer-motion";
import apiClient from "../config/apiClient";

interface QuestionaryModuloProps {
    questions: Modulo[]
    numQuestions: number
    questionaryId?: string
    guestId?: string
    startTime: number | null
    initialModule: number

    moduleScores: number[]
    setModuleScores: React.Dispatch<React.SetStateAction<number[]>>
    setCompletedModules: React.Dispatch<React.SetStateAction<number[]>>

    onNextModule: (nextModuleIndex: number) => void
    onEvaluated: (
        score: number,
        attempts: number | null,
        moduleScores: number[],
        moduleAttempts?: Record<string, number>
    ) => void

}

export function QuestionaryModulo({
    questions,
    numQuestions,
    questionaryId,
    guestId,
    initialModule,
    moduleScores,
    setModuleScores,
    setCompletedModules,
    onEvaluated,
}: QuestionaryModuloProps) {

    const [selectedOptions, setSelectedOptions] =
        useState<{ [key: string]: string }>({})

    const [currentModuleIndex] = useState(initialModule)

    const [moduleStartTime, setModuleStartTime] = useState<number>(Date.now())

    const submitModule = async (moduleIndex: number) => {


        const correctAnswers: { [index: string]: boolean } = {}
        const chosenAnswers: { [index: string]: string } = {}
        const chosenTexts: { [index: string]: string } = {}

        let moduleScore = 0

        visibleQuestions.forEach((p) => {

            const questionKey = p.id

            const selected = selectedOptions[questionKey]?.trim().toLowerCase()

            const correctAlt = p.alternativas.find(a => a.correcta === true)
            const correct = correctAlt?.opcion?.trim().toLowerCase()

            const isCorrect = selected === correct

            correctAnswers[questionKey] = isCorrect
            chosenAnswers[questionKey] = selected ?? ""

            const selectedAlt = p.alternativas.find(
                a => a.opcion.trim().toLowerCase() === selected
            )

            chosenTexts[questionKey] = selectedAlt?.texto ?? ""

            if (isCorrect) moduleScore++
        })

        try {


            const endTime = Date.now()
            const duration = (endTime - moduleStartTime) / 1000

            const payload: any = {
                trabajador_id: guestId,
                module_index: moduleIndex,
                results: correctAnswers,
                answers: chosenAnswers,
                texts: chosenTexts,
                module_score: moduleScore,
                duration: duration
            }

            const res = await apiClient.post(
                `/questions/submitModule/${questionaryId}`,
                payload,
                {

                }
            )

            const updatedScores = [...moduleScores]
            updatedScores[moduleIndex] = moduleScore
            setModuleScores(updatedScores)

            const totalScore = updatedScores.reduce((a, b) => a + b, 0)

            onEvaluated(totalScore, res.data.intentos ?? null, updatedScores, res.data.module_attempts)

        } catch (err: any) {
            const updatedScores = [...moduleScores]
            updatedScores[moduleIndex] = moduleScore
            setModuleScores(updatedScores)

            const totalScore = updatedScores.reduce((a, b) => a + b, 0)

            onEvaluated(totalScore, null, updatedScores)
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

    const currentModule = questions[currentModuleIndex]

    const [visibleQuestions, setVisibleQuestions] = useState(
        currentModule?.preguntas ?? []
    )

    useEffect(() => {
        if (!currentModule) return

        const visibleCount =
            currentModule.visible_questions ??
            numQuestions ??
            currentModule.preguntas.length

        const randomQuestions = shuffleArray(
            currentModule.preguntas
        ).slice(0, visibleCount)

        setVisibleQuestions(randomQuestions)
        setModuleStartTime(Date.now())
    }, [currentModuleIndex, questions])

    const isModuleComplete = visibleQuestions.every((q) => {
        return !!selectedOptions[q.id]
    })


    return (
        <motion.div
            key={currentModuleIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6">
            <div>
                Modulo: {currentModuleIndex + 1} / {questions.length}
            </div>

            {questions.length > 0 ? (
                <>
                    <div className="flex flex-col border border-gray-200 rounded-xl p-3 gap-3">
                        <div className="px-1 py-3">
                            <h1 className="text-xl sm:text-2xl font-semibold">
                                {questions[currentModuleIndex].modulo}
                            </h1>

                        </div>
                        {visibleQuestions.map((question, questionIndex) => {

                            return (
                                <div key={questionIndex} className="p-6 rounded-xl shadow-sm hover:shadow-md
                                    border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800">
                                    <div className="flex flex-col gap-2 mb-4">
                                        <h1 className="text-xl sm:text-2xl font-semibold">
                                            Pregunta {questionIndex + 1}:
                                        </h1>
                                        <p className="text-base sm:text-xl md:text-2xl mt-2 mb-2">
                                            {question.pregunta}
                                        </p>
                                    </div>
                                    <div className="flex flex-col my-3">
                                        {question.alternativas.map((alt, i) => {
                                            const isSelected = selectedOptions[question.id] === alt.opcion
                                            return (
                                                <div key={i}>
                                                    <SingleOption
                                                        label={alt.opcion}
                                                        text={alt.texto}
                                                        selected={isSelected}
                                                        onSelect={() => {
                                                            setSelectedOptions(prev => ({
                                                                ...prev,
                                                                [question.id]: alt.opcion
                                                            }))
                                                        }}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button
                        onClick={async () => {
                            if (!isModuleComplete) return

                            await submitModule(currentModuleIndex)

                            setCompletedModules(prev => {
                                if (prev.includes(currentModuleIndex)) return prev
                                return [...prev, currentModuleIndex]
                            })

                            if (currentModuleIndex < questions.length - 1) {
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                })
                            }
                        }}
                        disabled={!isModuleComplete}
                        className={`mt-4 py-2 px-4 rounded-md font-semibold transition
                            ${isModuleComplete
                                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        Evaluar
                    </button>
                </>
            )
                : (
                    <p>No hay preguntas todavía.</p>
                )}
        </motion.div>
    )
}