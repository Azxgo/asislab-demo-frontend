import { AnimatePresence, motion } from "framer-motion";
import { Title } from "react-head";
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaEllipsis, FaRegTrashCan, FaPenToSquare, FaLayerGroup, FaMagnifyingGlass } from "react-icons/fa6";
import { AreaModal } from "../components/AreaModal"
import { DropdownMenu } from "../components/DropdownMenu"
import { Spinner } from "../components/visuals/Spinner"
import { Toast } from "../components/visuals/Toast";
import { ConfirmModal } from "../components/questionary/ConfirmModal";
import { getPercentageColor } from "../utills/getPercentColor";
import type { Area } from "../types/area";
import { OpenModalButton } from "../components/OpenModalButton";
import { BulkBar } from "../components/BulkBar";
import { ViewAreaWorkers } from "../components/area/ViewAreaWorkers";
import { FaUser } from "react-icons/fa";
import { IndexPagesTable } from "../components/ui/IndexPagesTable";
import apiClient from "../config/apiClient";

export default function AreaIndexPage() {
    // Áreas
    const [areas, setAreas] = useState<Area[]>([])
    // Abrir menu de acciones
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    // Estados para guardar id y abrir modal para agregar / editar
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    // Estados que guardan ids en seleccion y borrado.
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const areasPerPage = 30;
    // Busquede
    const [searchTerm, setSearchTerm] = useState("")
    // Estados para abrir ConfirmModal y Toast
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // Estados de error y cargado
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Funcion para llamar a las Áreas
    const fetchAreas = async () => {
        setLoading(true)
        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados.
            const res = await apiClient.get<{ areas: Area[] }>(
                "/areas/getAll",
                // Importante
                {

                }
            );
            // Guarda las áreas en el estado.
            setAreas(res.data.areas)
        } catch (err) {
            console.error("Error al obtener areas:", err)
            setError("No se pudieron cargar las Areas.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAreas()
    }, [])


    // Funcion para borrar áreas
    const handleDelete = async () => {
        if (deleteIds.length === 0) return;
        setConfirmModalOpen(false);

        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados

            let deletedCount = 0;
            let failedCount = 0;

            // Hace un map con todas las id guardadas en el estado, llamando al endpoint de borrar.
            // Todas las ejecuciones se hacen individualmente para manejar errores de cada área
            for (const id of deleteIds) {
                try {
                    await apiClient.delete(`/areas/delete/${id}`, {
                        // Importante

                    });
                    deletedCount++;
                } catch (err: any) {
                    // Si falla (por ejemplo tiene cuestionarios asociados) contamos como fallo
                    console.error(`No se pudo borrar el área ${id}`, err);
                    failedCount++;
                }
            }

            fetchAreas();

            // Actualiza selectedIds removiendo los que se borraron
            setSelectedIds((prev) => prev.filter((id) => !deleteIds.includes(id)));

            // Dependiendo si fue un área eliminada o más de una, el mensaje que aparece en el toast es distinto
            if (deletedCount > 0) {
                setToast({
                    message:
                        deletedCount === 1
                            ? "El Área fue eliminada."
                            : `${deletedCount} Áreas fueron eliminadas.`,
                    type: "success",
                });
            }
            if (failedCount > 0) {
                setToast({
                    message:
                        failedCount === 1
                            ? "No se pudo borrar un Área (tiene cuestionarios asociados)."
                            : `No se pudieron borrar ${failedCount} Áreas (tienen cuestionarios asociados).`,
                    type: "error",
                });
            }

        } catch (err: any) {
            console.error("Error al borrar Área", err)

            setToast({
                message:
                    err.response?.data?.error
                        ? err.response.data.error
                        : "No se pudo borrar el Área",
                type: "error",
            });
        } finally {
            setDeleteIds([]);
        }
    }

    const filteredAreas = areas.filter((q: any) =>
        q.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const indexOfLastArea = currentPage * areasPerPage;
    const indexOfFirstArea = indexOfLastArea - areasPerPage
    const currentAreas = filteredAreas.slice(indexOfFirstArea, indexOfLastArea)
    const totalPages = Math.ceil(filteredAreas.length / areasPerPage)

    //Funcion para abrir modal de Agregar / Editar
    const handleOpenModal = (id?: string) => {
        setSelectedId(id || null);
        setIsModalOpen(true);
    };

    //Funcion para cerrar modal de Agregar / Editar
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
    };

    const handleOpenViewModal = (id: string) => {
        setSelectedId(id);
        setIsViewModalOpen(true);
    }


    useEffect(() => {
        if (!searchTerm) return;

        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 800);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="flex flex-col rounded-lg min-h-50 p-4 sm:p-6 md:p-8 lg:p-8 
        border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[900px]">
            <div className="flex flex-col gap-2">
                {/* Boton para agregar Áreas */}
                <OpenModalButton
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaLayerGroup size={22} />
                    Agregar Area
                </OpenModalButton>

                {/* Spinner cuando los elementos se esten cargando */}
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <p className="w-full text-red-500 text-center font-medium">{error}</p>
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Si hay elementos seleccionados aparece este div */}
                            {selectedIds.length > 0 && (
                                <BulkBar
                                    count={selectedIds.length}
                                    onDelete={() => {
                                        setDeleteIds(selectedIds);
                                        setConfirmModalOpen(true);
                                    }}
                                />
                            )}

                            {/* Tabla de Elementos */}
                            <div className="border border-gray-200 dark:border-zinc-600 rounded-lg">

                                <IndexPagesTable
                                    data={currentAreas}
                                    rowKey={(a) => a._id}
                                    loading={loading}
                                    selectable
                                    selected={selectedIds}
                                    onSelectChange={setSelectedIds}
                                    emptyMessage="No existen áreas"

                                    columns={[
                                        {
                                            key: "nombre", label: "Nombre",
                                            render: (a) => (
                                                <Link
                                                    to={`/questionary/area/${a._id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xl"
                                                >
                                                    {a.nombre}
                                                </Link>
                                            ),
                                            width: "1fr"
                                        },
                                        { key: "num_questionnaries", label: "Cuestionarios", width: "1fr", hideOn: "sm", },
                                        { key: "num_workers", label: "Trabajadores", width: "1fr", hideOn: "sm", },
                                        {
                                            key: "avg_percentages", label: "Promedio",
                                            render: (a) => (
                                                <span className={getPercentageColor(a.avg_percentages)}>
                                                    {a.avg_percentages}
                                                </span>
                                            ),
                                            width: "1fr",
                                            hideOn: "sm",
                                        },
                                    ]}

                                    renderActions={(a) => (
                                        <DropdownMenu
                                            isOpen={openMenuId === a._id}
                                            onToggle={() =>
                                                setOpenMenuId(openMenuId === a._id ? null : a._id)
                                            }
                                            label={<FaEllipsis size={26} />}
                                        >
                                            {/* Abre modal para editar */}
                                            <button
                                                onClick={() => handleOpenModal(a._id)}
                                                className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200 cursor-pointer
                                                                        w-full"
                                            >
                                                <FaPenToSquare size={24} />
                                                <span className="text-lg font-semibold">Editar</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenViewModal(a._id)}
                                                className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200 cursor-pointer
                                                                        w-full"
                                            >
                                                <FaUser size={24} />
                                                <span className="text-lg font-semibold">Trabajadores</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteIds([a._id]);
                                                    setConfirmModalOpen(true);
                                                }}
                                                className="flex items-center gap-3 
                                                                    bg-red-500 hover:bg-red-600 active:bg-red-700 p-2
                                                                    dark:bg-red-700 dark:hover:bg-red-600
                                                                    text-white w-full cursor-pointer transition-all duration-200"
                                            >
                                                <FaRegTrashCan size={24} />
                                                <span className="text-lg font-semibold">Borrar</span>
                                            </button>
                                        </DropdownMenu>
                                    )}
                                />
                            </div>
                            {areas.length > areasPerPage && (
                                <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-4">
                                    {/* Input de búsqueda */}
                                    <div className="w-full md:max-w-lg">
                                        <div className="flex gap-4 items-center">
                                            <FaMagnifyingGlass size={24} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre, apellidos o correo..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600
                                                    bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Paginación */}
                                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 md:mt-0">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            className="
                                                    px-3 py-1 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-100
                                                    cursor-pointer transition-colors transition-transform duration-150
                                                    hover:bg-gray-300 dark:hover:bg-zinc-600 active:scale-95
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    disabled:hover:bg-gray-200 dark:disabled:hover:bg-zinc-700
                                                    "
                                        >
                                            Anterior
                                        </button>

                                        <span className="px-2">
                                            Página {currentPage} de {totalPages}
                                        </span>

                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            className="
                                                    px-3 py-1 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-100
                                                    cursor-pointer transition-colors transition-transform duration-150
                                                    hover:bg-gray-300 dark:hover:bg-zinc-600 active:scale-95
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    disabled:hover:bg-gray-200 dark:disabled:hover:bg-zinc-700
                                                    "
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Modal de confirmación */}
                            <ConfirmModal
                                isOpen={confirmModalOpen}
                                title={
                                    deleteIds.length > 1
                                        ? `¿Estás seguro de borrar estos ${deleteIds.length} elementos?`
                                        : "¿Estás seguro de borrar este elemento?"
                                }
                                description="¡No podrás revertir esta acción!"
                                onConfirm={handleDelete}
                                onCancel={() => setConfirmModalOpen(false)}
                            />
                        </motion.div>
                    </>
                )}
            </div>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modal para agregar/editar */}
            <AreaModal
                id={selectedId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={fetchAreas}
            />

            <ViewAreaWorkers
                id={selectedId ?? " "}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
            <Title>Áreas</Title>
        </div >
    )
}