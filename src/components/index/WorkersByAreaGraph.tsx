import axios from "axios";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAreas } from "../../hooks/useAreas";

export function WorkersByAreaGraph() {
  const { areas } = useAreas()
  
  const [workers, setWorkers] = useState<any[]>([]);
  //ARREGLAR , quiza poner un fetch de un hook??
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/workers/getAll");
        setWorkers(res.data.workers || []);
      } catch (err) {
        console.error("Error al obtener trabajadores:", err);
      }
    };
    fetchWorkers();
  }, []);

  const areaMap: Record<string, string> = {};

  areas.forEach(area => {
    areaMap[String(area._id)] = area.nombre;
  });

  // Contar trabajadores por tipo de contrato
  const areaCount: Record<string, number> = {};
  workers.forEach(worker => {
    const id = String(worker.area_id);
    areaCount[id] = (areaCount[id] || 0) + 1;
  });

  // Crear array para el PieChart y ordenar de mayor a menor
  const chartData = Object.entries(areaCount)
    .map(([id, value]) => ({
      name: areaMap[id] || "Sin área",
      value
    }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4C4C"];

  return (
    <div className="flex flex-col p-2" style={{ width: "100%", height: "100%" }}>
      <h1 className="text-2xl mb-6 font-semibold text-gray-700 dark:text-zinc-100">
        Trabajadores por Area
      </h1>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              strokeWidth={1}
              fill="#8884d8"
              labelLine={true}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => `${value} trabajadores`}
              contentStyle={{
                backgroundColor: "var(--chart-bg)",
                borderColor: "var(--chart-border)",
                color: "var(--chart-text)",
              }}
              itemStyle={{ color: "var(--chart-text)" }}
              labelStyle={{ color: "var(--chart-text)" }}
            />
            <Legend verticalAlign="bottom"
              wrapperStyle={{
                color: "var(--chart-text)",
              }} />

          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
