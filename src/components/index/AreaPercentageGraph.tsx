import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend, PolarAngleAxis } from "recharts";
import { useAreas } from "../../hooks/useAreas";

export function AreaPercentageGraph() {
    const { areas } = useAreas()

    const getColor = (value: number) => {
        if (value < 40) return "#ef4444";
        if (value < 70) return "#f59e0b";
        return "#22c55e";
    };

    const chartData = areas
        .map((area) => {
            const percentage = parseFloat(
                (area.avg_percentages || "0%").replace("%", "")
            );

            const value = isNaN(percentage) ? 0 : percentage;

            return {
                name: area.nombre,
                value,
                fill: getColor(value),
            };
        })
        .filter((a) => a.value > 0 && a.name !== "Sin Área"); // 🔥 filtro clave

    return (
        <div className="flex flex-col p-2 w-full h-full">
            <h1 className="text-2xl mb-6 font-semibold text-gray-700 dark:text-zinc-100">
                % de rendimiento por área
            </h1>

            <div style={{ width: "100%", height: '100%' }}>
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="70%"
                        innerRadius="20%"
                        outerRadius="95%"
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                    >

                        <PolarAngleAxis type="number" domain={[0, 100]} />

                        <RadialBar
                            background
                            dataKey="value"
                            label={{
                                position: "insideStart",
                                formatter: (v: any) => `${v}%`,
                            }}
                        />

                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;

                                    return (
                                        <div className="bg-white dark:bg-zinc-800 p-2 rounded shadow">
                                            <p className="font-semibold">{data.name}</p>
                                            <p>{data.value}%</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}