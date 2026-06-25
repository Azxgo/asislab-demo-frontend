import React, { useEffect, useState } from "react";
import { Spinner } from "../visuals/Spinner";
import { motion } from "framer-motion";
import apiClient from "../../config/apiClient";

interface Questionary {
    _id: string;
    nombre: string;
    estado?: string;
    fecha_comienzo: { $date: string } | string;
    fecha_limite: { $date: string } | string;
    area_nombre: string;
    prom_porcentaje?: string;
    prom_puntaje?: string;
}

export const QuestionaryStatus: React.FC = () => {
    const [questionaries, setQuestionaries] = useState<Questionary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestionaries = async () => {
            try {
                const { data } = await apiClient.get("/questions/getAll");
                setQuestionaries(data.questionaries || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionaries();
    }, []);

    const now = new Date();

    const getDiasRetraso = (endDate: Date) => {
        const diffMs = now.getTime() - endDate.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    const normalizeDate = (d: { $date: string } | string) =>
        d && typeof d === "object" && "$date" in d ? new Date(d.$date) : new Date(d);

    const formatDate = (d: { $date: string } | string) =>
        normalizeDate(d).toLocaleDateString("es-CL");

    const porEmpezar = questionaries.filter(q => {
        const end = normalizeDate(q.fecha_limite);

        return (
            q.estado === "en espera" &&
            end >= now
        );
    });

    const activos = questionaries.filter(q => {
        const end = normalizeDate(q.fecha_limite);
        return q.estado === "activo" && end >= now;
    });

    const retraso = questionaries.filter(q => {
        const end = normalizeDate(q.fecha_limite);
        return q.estado !== "cerrado" && q.estado !== "en espera" && end < now;
    });

    type ColorKey = "blue" | "green" | "red";

    const colorStyles: Record<ColorKey, string> = {
        blue: `
        border-blue-700 dark:border-blue-700/30
        bg-white hover:bg-gray-50
        dark:bg-zinc-700 dark:hover:bg-zinc-600
    `,
        green: `
        border-green-500 dark:border-green-600/30
        bg-white hover:bg-gray-50
        dark:bg-zinc-700 dark:hover:bg-zinc-600
    `,
        red: `
        border-red-600 dark:border-red-600/30
        bg-white hover:bg-gray-50
        dark:bg-zinc-700 dark:hover:bg-zinc-600
    `,
    };

    const renderCard = (q: Questionary, color: ColorKey) => {
        const end = normalizeDate(q.fecha_limite);
        const diasRetraso = getDiasRetraso(end);

        return (
            <div
                key={q._id}
                className={`p-4 mb-4 rounded-lg shadow-md border-l-4 transition-colors
                    text-gray-700 dark:text-zinc-100
                    ${colorStyles[color]}`}
            >
                <h3 className="font-semibold text-lg">{q.nombre}</h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">{q.area_nombre}</p>
                <p className="text-sm mt-1">
                    Comienzo: {formatDate(q.fecha_comienzo)} <br />
                    Límite: {formatDate(q.fecha_limite)}
                </p>
                <p className="text-sm mt-1">
                    Estado: <span className="font-medium">{q.estado || "N/A"}</span>
                </p>

                {color === "red" && (
                    <p className="text-sm mt-2 font-semibold text-red-700 dark:text-red-400">
                        Días de retraso: {diasRetraso}
                    </p>
                )}
                <p className="text-sm mt-1">
                    Promedio: {q.prom_puntaje || "[0 / 0]"} ({q.prom_porcentaje || "0%"})
                </p>
            </div>
        )
    };

    if (loading) return <div className="text-center mt-10 text-gray-500"><Spinner /></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-2 max-w-7xl mx-auto"
        >
            <h1 className="text-2xl mb-6 font-semibold text-gray-700 dark:text-zinc-100">Estado en Capacitaciones</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div>
                    <div className="flex justify-center items-center p-2 rounded-t-lg bg-blue-700 dark:bg-blue-700/30">
                        <h2 className="text-xl font-semibold text-white">Por empezar</h2>
                    </div>
                    <div className="p-4 rounded-b-lg min-h-[300px] max-h-[400px] 
                    bg-gray-100 dark:bg-zinc-700/30
                    overflow-y-auto scrollbar-custom">
                        {porEmpezar.length > 0
                            ? porEmpezar.map(q => renderCard(q, "blue"))
                            : <p className="text-gray-500">No hay cuestionarios próximos.</p>}
                    </div>
                </div>

                <div>
                    <div className="flex justify-center items-center p-2 rounded-t-lg bg-green-500 dark:bg-green-600/30">
                        <h2 className="text-xl font-semibold text-white">Activo</h2>
                    </div>
                    <div className="p-4 rounded-b-lg min-h-[300px] max-h-[400px] 
                    bg-gray-100 dark:bg-zinc-700/30
                    overflow-y-auto scrollbar-custom">
                        {activos.length > 0
                            ? activos.map(q => renderCard(q, "green"))
                            : <p className="text-gray-500">No hay cuestionarios activos.</p>}
                    </div>
                </div>

                <div>
                    <div className="flex justify-center items-center p-2 rounded-t-lg bg-red-600 dark:bg-red-600/30">
                        <h2 className="text-xl font-semibold text-white">Retraso</h2>
                    </div>
                    <div className="p-4 rounded-b-lg min-h-[300px] max-h-[400px] 
                    bg-gray-100 dark:bg-zinc-700/30
                    overflow-y-auto scrollbar-custom">
                        {retraso.length > 0
                            ? retraso.map(q => renderCard(q, "red"))
                            : <p className="text-gray-500">No hay cuestionarios en retraso.</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};