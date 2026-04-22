import axios from "axios";
import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { groupByPeriod } from "../../utills/groupByPeriod";

export function WorkersGraph() {
    const [workers, setWorkers] = useState<any[]>([]);
    const [yearFilter, setYearFilter] = useState<string>("");
    const [monthFilter, setMonthFilter] = useState<string>("Todos");

    //ARREGLAR , quiza poner un fetch de un hook??
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await axios.get("http://localhost:5000/workers/getAll");
                const data = res.data.workers || [];
                setWorkers(data);

                const currentYear = new Date().getFullYear().toString();
                const yearsInData = Array.from(
                    new Set(data.map((w: any) => w.fechaIngreso.split("-")[0]))
                );

                if (yearsInData.includes(currentYear)) {
                    setYearFilter(currentYear);
                } else {
                    const lastYear = yearsInData.sort().at(-1);
                    setYearFilter(lastYear ? String(lastYear) : "");
                }
            } catch (err) {
                console.error("Error al obtener trabajadores:", err);
            }
        };
        fetchWorkers();
    }, []);

    // Datos que se van a mostrar
    const chartData = groupByPeriod(workers);

    // Parametros para filtrar
    const filteredData = chartData.filter((item) => {
        const [year, month] = item.periodo.split("-");
        const matchYear = !yearFilter || year === yearFilter;
        const matchMonth = monthFilter === "Todos" || month === monthFilter;
        return matchYear && matchMonth;
    });

    const years = Array.from(
        new Set(workers.map(w => w.fechaIngreso.split("-")[0]))
    ).sort();

    const months = Array.from(
        new Set(workers.map(w => w.fechaIngreso.split("-")[1]))
    ).sort();

    const monthNames: Record<string, string> = {
        "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
        "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
        "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
    };

    return (
        <div className="flex flex-col p-2" style={{ width: "100%", height: "100%" }}>
            <h1 className="text-2xl mb-6 font-semibold text-gray-700 dark:text-zinc-100">
                Numero de Trabajadores
            </h1>
            {/* Filtros */}
            <div className="flex gap-3 mb-5 flex-wrap items-center dark:text-zinc-200">
                <div>
                    <label className="mr-2 font-semibold">Año:</label>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="border rounded p-1
                        bg-white text-gray-700 border-gray-300
                        dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600
                        "
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mr-2 font-semibold">Mes:</label>
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="border rounded p-1
                        bg-white text-gray-700 border-gray-300
                        dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600
                        "
                    >
                        <option value="Todos">Todos</option>
                        {months.map((m) => (
                            <option key={m} value={m}>{monthNames[m] || m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Gráfico */}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis stroke="var(--chart-text)" dataKey="periodo" />
                    <YAxis allowDecimals={false} tick={{ fill: "var(--chart-text)" }} />
                    <Tooltip contentStyle={{
                        backgroundColor: "var(--chart-bg)",
                        borderColor: "var(--chart-grid)",
                        color: "var(--chart-text)"
                    }}
                        cursor={{ fill: "var(--chart-cursor)" }} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" barSize={30} radius={[5, 5, 5, 5]} name="Trabajadores ingresados" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
