
import { Link } from "react-router-dom"
import { Title } from "react-head"
import { FaUser, FaClipboardList, FaLayerGroup } from "react-icons/fa6"
import { QuestionaryStatus } from "../components/index/QuestionaryStates"
import { IndexButton } from "../components/index/IndexButton"
import { ActiveCoursesGraph } from "../components/index/ActiveCoursesGraph"
import { WorkersGraph } from "../components/index/WorkersGraph"
import { WorkersByAreaGraph } from "../components/index/WorkersByAreaGraph"
import { AreaPercentageGraph } from "../components/index/AreaPercentageGraph"

export default function IndexPage() {
    return (
        <div className="container mx-auto min-h-screen bg-white rounded-lg">
            <div className="flex flex-col rounded-lg min-h-50 p-4 sm:p-6 md:p-8 lg:p-8 gap-6
                border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800"
            >

                {/* Sección de accesos rápidos */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={"/area"} className="flex-1">
                        <IndexButton>
                            <FaLayerGroup size={26} />
                            <h1 className="text-base sm:text-lg font-semibold">Áreas</h1>
                        </IndexButton>
                    </Link>

                    <Link to={"/questionary"} className="flex-1">
                        <IndexButton>
                            <FaClipboardList size={26} />
                            <h1 className="text-base sm:text-lg font-semibold">Cuestionarios</h1>
                        </IndexButton>
                    </Link>

                    <Link to={"/workers"} className="flex-1">
                        <IndexButton>
                            <FaUser size={26} />
                            <h1 className="text-base sm:text-lg font-semibold">Trabajadores</h1>
                        </IndexButton>
                    </Link>
                </div>

                {/* Estado de cuestionarios */}
                <div className="border border-gray-300 dark:border-zinc-600 p-3 rounded-lg">
                    <QuestionaryStatus />
                </div>

                {/* Gráficos 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-300 dark:border-zinc-600 rounded-lg p-3 h-[400px] sm:h-[480px]">
                        <ActiveCoursesGraph />
                    </div>
                    <div className="border border-gray-300 dark:border-zinc-600 rounded-lg p-3 h-[400px] sm:h-[480px]">
                        <WorkersGraph />
                    </div>
                </div>

                {/* Gráficos 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-300 dark:border-zinc-600 p-3 rounded-lg">
                        <WorkersByAreaGraph />
                    </div>
                    <div className="border border-gray-300 dark:border-zinc-600 p-3 rounded-lg">
                        <AreaPercentageGraph />
                    </div>
                </div>
            </div>

            <Title>Inicio</Title>
        </div>
    )
}