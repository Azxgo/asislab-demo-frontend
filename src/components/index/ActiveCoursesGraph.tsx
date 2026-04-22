import axios from "axios";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ActiveCoursesGraph() {
    const [questionnaries, setQuestionnaires] = useState<any[]>([]);

    //ARREGLAR , quiza poner un fetch de un hook??
    useEffect(() => {
        const fetchQuestionnaires = async () => {
            try {
                const res = await axios.get("http://localhost:5000/questions/getAll")
                const data = res.data.questionaries || []
                const activos = data.filter((q: any) => q.estado === "activo")
                setQuestionnaires(activos)
            } catch (err) {
                console.error("Error al obtener cuestionarios:", err);
            }
        }
        fetchQuestionnaires()
    }, [])

    // Datos que se van a mostrar
    const chartData = questionnaries.map(q => ({
        nombre: q.nombre,
        porcentaje: parseFloat(q.prom_porcentaje)
    }))

    return (
        <div className=" flex flex-col p-2 h-full">
            <h1 className="text-2xl mb-6 font-semibold text-gray-700 dark:text-zinc-100">
                Avance en Capacitaciones Activas
            </h1>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                    barCategoryGap={10}
                >
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="var(--chart-text)" domain={[0, 100]} />
                    <YAxis dataKey="nombre" type="category" width={20}
                        tick={{
                            fill: "var(--chart-text)",
                            fontSize: 15 
                        }}
                        tickFormatter={(value: string) =>
                            value.length > 10 ? value.slice(0, 10) + "..." : value
                        }
                    />
                    <Tooltip contentStyle={{
                        backgroundColor: "var(--chart-bg)",
                        borderColor: "var(--chart-grid)",
                        color: "var(--chart-text)"
                    }}
                        cursor={{ fill: "var(--chart-cursor)" }}
                    />
                    <Bar dataKey="porcentaje" fill="#8884d8" barSize={30} radius={[5, 5, 5, 5]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}