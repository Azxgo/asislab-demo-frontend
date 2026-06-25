
import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { LoadingDots } from "./visuals/LoadingDots";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../config/apiClient";

interface QuestionaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    resumeId?: string | null;
    isResuming?: boolean;
}

export function QuestionaryModal({ isOpen, onClose, onSave, resumeId, isResuming }: QuestionaryModalProps) {
    // Parametros a cambiar
    const [name, setName] = useState("");
    const [area, setArea] = useState("");
    const [assignWorkers, setAssignWorkers] = useState(false);
    const [areasList, setAreasList] = useState<{ _id: string, nombre: string }[]>([])
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [type, setType] = useState<"normal" | "modulo">("normal");
    const [numQuestions, setNumQuestions] = useState<string>("5");
    const [bankQuestions, setBankQuestions] = useState<string>("10");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Mensajes y cargas
    const [message, setMessage] = useState("")
    const [messageDetail, setMessageDetail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [questionaryId, setQuestionaryId] = useState<string | null>(null);
    //const [progress, setProgress] = useState(0);

    const today = new Date().toISOString().split("T")[0];

    // CsrfToken
    const postWithCsrf = (url: string, data: any = {}) =>
        apiClient.post(url, data, {});

    // Cargar lista de áreas
    const fetchAreasList = async () => {
        try {
            const res = await apiClient.get("/areas/getAll");
            setAreasList(res.data.areas);
        } catch (err) {
            console.error("Error al cargar áreas:", err);
        }
    };

    // Reanudar proceso automáticamente si se abre desde la tabla
    useEffect(() => {
        if (isOpen && isResuming && resumeId) {
            handleResume();
        } else if (isOpen) {
            fetchAreasList();
        }
    }, [isOpen, isResuming, resumeId]);


    const handleFileValidation = (file: File | null) => {
        if (!file) return;

        const allowedTypes = ["application/pdf", "text/plain"];
        const maxSizeMB = 10
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // Validar formato
        if (!allowedTypes.includes(file.type)) {
            setMessage("Formato inválido. Solo se permiten archivos PDF o TXT.");
            setSelectedFile(null);
            return;
        }

        // Validar tamaño
        if (file.size > maxSizeBytes) {
            setMessage(`El archivo supera el máximo permitido: ${maxSizeMB}MB`);
            setSelectedFile(null);
            return;
        }

        // Si todo está ok
        setMessage("");
        setSelectedFile(file);
    };

    // Función que reanuda el proceso
    const handleResume = async () => {
        if (!resumeId) return;
        try {
            setIsLoading(true);
            setMessage("Reanudando proceso anterior...");

            const res = await apiClient.post(
                `/questions/resume/${resumeId}`
            );

            const steps = res.data.resume_steps;
            const etapaActual = res.data.etapa_actual;

            if (Array.isArray(steps) && steps.length > 0) {
                setMessage(`Reanudando desde la etapa: ${etapaActual}`);

                for (const step of steps) {
                    setMessage(step.msg);
                    const stepRes = await postWithCsrf(`${step.url}`);
                    if (stepRes.data.error) throw new Error(stepRes.data.error);
                    setMessage(stepRes.data.message || step.msg);
                }

                if (area && assignWorkers) {
                    setMessage("Asignando trabajadores del área...");

                    await postWithCsrf(
                        `/workers/assign_by_area/${resumeId}`,
                        { area }
                    );
                }

                setMessage("Verificando generación de preguntas...");
                const verify = await apiClient.get(
                    `/questions/get_questions/${resumeId}`
                );

                if (!verify.data.questions || verify.data.questions.length === 0) {
                    setMessage("No se encontraron preguntas, reintentando generación...");
                    const retry = await postWithCsrf(
                        `/questions/generate_questions/${resumeId}`
                    );

                    if (retry.data.error)
                        throw new Error(retry.data.error || "Error al reintentar generación");

                    const verifyAgain = await apiClient.get(
                        `/questions/get_questions/${resumeId}`
                    );

                    if (!verifyAgain.data.questions || verifyAgain.data.questions.length === 0) {
                        throw new Error("No se pudieron generar preguntas tras el reintento.");
                    }
                }

                setMessage("Proceso reanudado y preguntas generadas correctamente");
            } else {
                setMessage(res.data.message || "El cuestionario no requiere reanudación.");
            }

            onSave();
        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Error al reanudar el proceso.");
        } finally {
            setIsLoading(false);
            setMessageDetail("");
        }
    };

    // Subir cuestionario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setMessageDetail("");
        e.preventDefault();
        setIsLoading(true);

        const stop = (msg: string) => {
            setMessage(msg);
            setIsLoading(false);
        };

        if (!selectedFile) return stop("Por favor selecciona un archivo");
        if (!numQuestions || isNaN(Number(numQuestions))) return stop("Ingresa un número válido de preguntas mostradas")
        if (!bankQuestions || isNaN(Number(bankQuestions))) return stop("Ingresa un número válido del banco de preguntas")
        if (Number(numQuestions) > Number(bankQuestions)) return stop("Las preguntas mostradas no pueden ser mayores al banco de preguntas")

        if (!startDate || !endDate) return stop("Selecciona fechas de inicio y fin");
        if (startDate > endDate)
            return stop("La fecha de comienzo no puede ser mayor que la fecha límite");

        const formData = new FormData();
        formData.append("archivo", selectedFile);
        formData.append("nombre", name);
        formData.append("area", area);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        formData.append("type", type)
        formData.append("num_q", numQuestions.toString())
        formData.append("bank_q", bankQuestions.toString())

        try {
            setMessage("Subiendo archivo y procesando...");
            const uploadRes = await postWithCsrf(
                "/questions/upload_file",
                formData
            );

            const questionary_id = uploadRes.data.questionary_id;
            setQuestionaryId(questionary_id);

            const steps = [
                { msg: "Extrayendo texto...", url: `/questions/extract_text/${questionary_id}` },
                { msg: "Resumiendo texto...", url: `/questions/summarize/${questionary_id}` },
                { msg: "Generando charla...", url: `/questions/generate_talk/${questionary_id}` },
                { msg: "Generando preguntas...", url: `/questions/generate_questions/${questionary_id}` },
            ];

            for (const step of steps) {
                setMessage(step.msg);
                const res = await postWithCsrf(`${step.url}`);
                if (res.data.error) throw new Error(res.data.error);
            }

            if (area && assignWorkers) {
                setMessage("Asignando trabajadores del área...");

                await postWithCsrf(
                    `/workers/assign_by_area/${questionary_id}`,
                    { area }
                );
            }

            setMessage("Cuestionario guardado correctamente");
            onSave();
        } catch (error: any) {
            console.error("Error al enviar:", error);

            if (error.response && error.response.data) {
                const data = error.response.data;

                setMessage(
                    data.exception ||
                    data.error ||
                    "Error desconocido en el servidor"
                );
            } else {
                // Error genérico
                setMessage("Error al conectar con el servidor");
            }
        } finally {
            setIsLoading(false);
            setMessageDetail("");
        }
    };

    const downloadPDF = () => {
        const link = document.createElement("a")
        link.href = "/Capacitacion%20Alturas%20IA%20Chile.pdf";
        link.download = "Capacitacion Alturas IA Chile.pdf";
        link.click();

    }

    useEffect(() => {
        if (type === "normal") {
            setNumQuestions("8");
        } else if (type === "modulo") {
            setNumQuestions("5");
        }
    }, [type]);

    useEffect(() => {
        if (!isLoading || !questionaryId) return;

        const interval = setInterval(async () => {
            try {
                const res = await apiClient.get(
                    `/questions/status/${questionaryId}`
                );

                const { mensaje_detail, progreso } = res.data;

                setMessageDetail(mensaje_detail || "");

                // 🔹 Limpiar messageDetail cuando llegue al 100% o se complete
                if (progreso >= 100 || mensaje_detail.toLowerCase().includes("completado")) {
                    setMessageDetail("");
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Error al obtener status:", err);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading, questionaryId]);

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
                                <h2 className="text-xl font-semibold">
                                    {isResuming ? "Reanudando Cuestionario" : "Subir Cuestionario"}
                                </h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center justify-between rounded-lg gap-2 bg-gray-50 dark:bg-zinc-800">
                                        <div className="w-full">
                                            <p className="font-medium">Ejemplo de formato .pdf</p>
                                        </div>

                                        <button
                                            onClick={downloadPDF}
                                            className="flex  items-center justify-center gap-2 py-2 px-3
                                        bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                                        transition-all duration-200 cursor-pointer
                                        hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                                        >
                                            Descargar
                                        </button>
                                    </div>
                                    <button
                                        className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        <FaXmark size={20} />
                                    </button>
                                </div>

                            </div>

                            {isResuming ? (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-center">
                                        El cuestionario se está reanudando automáticamente.
                                    </p>
                                    {isLoading && <LoadingDots isLoading={isLoading} />}
                                    <p className="text-sm">{message}</p>
                                    {isLoading && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {messageDetail}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Drag & Drop agregado */}
                                        <div className="flex flex-col items-center gap-5 p-3 h-full">
                                            <div className="flex w-full h-full">
                                                <label
                                                    className="w-full cursor-pointer bg-blue-50 text-blue-700 px-5 py-3 rounded-lg 
                                                border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition flex items-center 
                                                justify-between gap-3 dark:bg-slate-900 dark:text-blue-300 dark:border-blue-800/30
                                                dark:hover:bg-slate-800 dark:hover:border-blue-700/30"
                                                    onDragOver={(e) => e.preventDefault()} // Permitir drop
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const file = e.dataTransfer.files[0];
                                                        handleFileValidation(file);
                                                    }}

                                                >
                                                    <span className="text-sm font-medium">
                                                        {selectedFile
                                                            ? selectedFile.name
                                                            : "Seleccionar archivo (.txt, .pdf)"}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept=".txt,.pdf"
                                                        className="hidden"
                                                        onChange={(e) => handleFileValidation(e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            </div>

                                            <div className="w-full rounded-xl flex flex-col gap-5">

                                                <div className="flex gap-2 items-center justify-between">

                                                    <div>

                                                        <label className="font-medium">Tipo</label>

                                                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                                                            Selecciona cómo se dividirá la capacitación
                                                        </p>
                                                    </div>

                                                    <div className="flex rounded-lg overflow-hidden 
                                                    border border-gray-200 dark:border-zinc-600">
                                                        <button
                                                            type="button"
                                                            onClick={() => setType("normal")}
                                                            className={`px-4 py-2 text-sm font-medium transition-all
                                                        ${type === "normal"
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                                                }`}
                                                        >
                                                            Normal
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setType("modulo")}
                                                            className={`px-4 py-2 text-sm font-medium transition-all
                                                                    ${type === "modulo"
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                                                }`}
                                                        >
                                                            Modulo
                                                        </button>

                                                    </div>

                                                </div>
                                                <div className="grid grid-cols-2 gap-4 ">

                                                    <div className="flex flex-col gap-1">
                                                        <label className="font-medium text-sm">
                                                            Preguntas mostradas
                                                        </label>

                                                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                            Cantidad que responderá el trabajador
                                                        </p>

                                                        <input
                                                            type="text"
                                                            value={numQuestions}
                                                            onChange={(e) => setNumQuestions(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <label className="font-medium text-sm">
                                                            Banco de preguntas
                                                        </label>

                                                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                            Total generado para cada módulo
                                                        </p>

                                                        <input
                                                            type="text"
                                                            value={bankQuestions}
                                                            onChange={(e) => setBankQuestions(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 py-3">
                                            <label className="font-medium">Nombre</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400 rounded-lg"
                                                disabled={isLoading}
                                            />
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
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="assignWorkers"
                                                    checked={assignWorkers}
                                                    disabled={!area}
                                                    onChange={(e) => setAssignWorkers(e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <label
                                                    htmlFor="assignWorkers"
                                                    className={`text-sm ${!area ? "opacity-50" : ""}`}
                                                >
                                                    Asignar automáticamente trabajadores del área
                                                </label>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">
                                                    Fecha inicio
                                                </label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400  rounded-lg"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="font-medium">
                                                    Fecha límite
                                                </label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    min={today}
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        if (value < today) {
                                                            setMessage(
                                                                "La fecha límite no puede ser anterior a hoy"
                                                            );
                                                            setEndDate("");
                                                            return;
                                                        }

                                                        if (startDate && value < startDate) {
                                                            setMessage(
                                                                "La fecha límite no puede ser menor que la fecha de inicio"
                                                            );
                                                            setEndDate("");
                                                            return;
                                                        }

                                                        setMessage("");
                                                        setEndDate(value);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-400  rounded-lg"
                                                />
                                            </div>

                                        </div>

                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex w-full items-center justify-center gap-2 py-2 
                                        bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100  font-semibold rounded-lg
                                        transition-all duration-200 cursor-pointer
                                        hover:bg-gray-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                                    >
                                        Subir
                                    </button>

                                    <div className="flex flex-col justify-center items-center">
                                        {isLoading && <LoadingDots isLoading={isLoading} />}
                                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{messageDetail}</p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}