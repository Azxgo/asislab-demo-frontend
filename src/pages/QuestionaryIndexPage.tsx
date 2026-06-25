
import { AnimatePresence, motion } from "framer-motion";
import { Title } from "react-head";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaEllipsis, FaRegTrashCan, FaRegChartBar, FaClipboardList, FaMagnifyingGlass, FaPenToSquare,  FaCopy } from "react-icons/fa6";
import { DropdownMenu } from "../components/DropdownMenu";
import { Spinner } from "../components/visuals/Spinner";
import { Toast } from "../components/visuals/Toast";
import { ConfirmModal } from "../components/questionary/ConfirmModal";
import { QuestionaryModal } from "../components/QuestionaryModal";
import { getPercentageColor } from "../utills/getPercentColor";
import { formatEstado } from "../utills/formatEstado";
import { QuestionaryEditModal } from "../components/QuestionaryEditModal";
import { OpenModalButton } from "../components/OpenModalButton";
import type { Cuestionario } from "../types/questionary";
import { BulkBar } from "../components/BulkBar";
import { IndexPagesTable } from "../components/ui/IndexPagesTable";
import apiClient from "../config/apiClient";

export default function Questionary() {
    // Parametro que hace fetch por id de area
    const { id } = useParams<{ id?: string }>();
    // Cuestionarios
    const [questionnaires, setQuestionnaires] = useState<Cuestionario[]>([]);
    // Abrir menu de acciones
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    // Estados que guardan ids en seleccion y borrado.
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const questionnairesPerPage = 30;
    // Busquede
    const [searchTerm, setSearchTerm] = useState("")
    // Estados para resumir proceso detenido
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [isResuming, setIsResuming] = useState(false);
    // Estados para abrir ConfirmModal y Toast
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // Estados de error y cargado
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Funcion para llamar a los cuestionarios
    const fetchQuestionnaires = async () => {
        setLoading(true);
        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados.
            // Si la url contiene un id de area, se llaman los cuestionarios del area
            const url = id
                ? `/questions/getAll?area_id=${id}`
                : `/questions/getAll`;

            const res = await apiClient.get<{ questionaries: Cuestionario[] }>(url, {});
            // Guarda los cuestionarios en el estado.
            setQuestionnaires(res.data.questionaries);
        } catch (err) {
            console.error("Error al obtener cuestionarios:", err);
            setError("No se pudieron cargar los cuestionarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestionnaires();
    }, [id]);



    // Funcion para borrar cuestionarios
    const handleDelete = async () => {
        if (deleteIds.length === 0) return;
        setConfirmModalOpen(false);

        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados
            // Hace un map con todas las id guardadas en el estado, llamando al endpoint de borrar.
            // Todas las ejecuciones se hacen en paralelo por Promise.all
            await Promise.all(
                deleteIds.map((id) =>
                    apiClient.delete(`/questions/delete/${id}`, {})
                )
            );

            fetchQuestionnaires();

            // Dependiendo si fue un cuestionario eliminado o mas de uno, 
            // el mensaje que aparece en el toast es distinto
            setToast({
                message:
                    deleteIds.length === 1
                        ? "El cuestionario fue eliminado."
                        : `${deleteIds.length} cuestionarios fueron eliminados.`,
                type: "success",
            });
        } catch (err) {
            console.error(err);
            setToast({
                message: "No se pudieron eliminar los cuestionarios.",
                type: "error",
            });
        } finally {
            setDeleteIds([]);
            setSelectedIds([]);
        }
    };

    const handleDuplicate = (id: string) => {
        try {

            apiClient.post(`/questions/duplicate/${id}`,
                {}
            )

            fetchQuestionnaires()

            setToast({
                message: "Cuestionario duplicado.",
                type: "success"
            });
        } catch (err) {
            console.error(err);

            setToast({
                message: "No se pudo duplicar el cuestionario.",
                type: "error"
            });
        }


    }

    // Función que pasa parametros de resumir al modal
    const handleResume = (id: string) => {
        setResumeId(id);
        setIsResuming(true);
        setIsAddModalOpen(true);
    };

    const handleOpenModal = (id?: string) => {
        setSelectedId(id || null);
        setIsEditModalOpen(true);
    };

    // Parametros de busqueda
    const filteredQuestionnaires = questionnaires.filter((q: any) =>
        q.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Paginación
    const indexOfLastQuestionary = currentPage * questionnairesPerPage;
    const indexOfFirstQuestionary = indexOfLastQuestionary - questionnairesPerPage
    const currentQuestionnaires = filteredQuestionnaires.slice(indexOfFirstQuestionary, indexOfLastQuestionary)
    const totalPages = Math.ceil(filteredQuestionnaires.length / questionnairesPerPage)

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

    console.log(currentQuestionnaires)

    return (
        <div className="flex flex-col rounded-lg min-h-50 p-4 sm:p-6 md:p-8 lg:p-8 
        border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[900px]">
            <div className="flex flex-col gap-2">
                <OpenModalButton
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <FaClipboardList size={22} />
                    Agregar Cuestionario
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
                                    data={currentQuestionnaires}
                                    rowKey={(q) => q._id}
                                    loading={loading}
                                    selectable
                                    selected={selectedIds}
                                    onSelectChange={setSelectedIds}
                                    emptyMessage="No existen cuestionarios"

                                    columns={[
                                        {
                                            key: "nombre", label: "Nombre",
                                            render: (q) => (
                                                <Link
                                                    to={`/questionary/view/${q._id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xl"
                                                >
                                                    {q.nombre}
                                                </Link>
                                            )
                                            ,
                                            width: "6fr"
                                        },
                                        {
                                            key: "area_nombre", label: "Área",
                                            render: (q) => (
                                                <Link
                                                    to={`/questionary/area/${q.area_id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xl"
                                                >
                                                    {q.area_nombre}
                                                </Link>
                                            )
                                            ,
                                            hideOn: "sm",
                                            width: "2fr"
                                        },
                                        {
                                            key: "prom_porcentaje", label: "Promedio",
                                            render: (q) => (
                                                <span className={getPercentageColor(q.prom_porcentaje)}>
                                                    {q.prom_porcentaje}
                                                </span>
                                            ),
                                            hideOn: "sm",
                                            width: "2fr"
                                        },
                                        {
                                            key: "estado", label: "Estado",
                                            render: (q) => {
                                                const estado = formatEstado(q.estado)
                                                return <span className={estado.className}>• {estado.text}</span>
                                            }
                                            ,width: "2fr",
                                            hideOn: "sm",
                                        },
                                    ]}

                                    renderActions={(q) => (
                                        <DropdownMenu
                                            isOpen={openMenuId === q._id}
                                            onToggle={() =>
                                                setOpenMenuId(openMenuId === q._id ? null : q._id)
                                            }
                                            label={<FaEllipsis size={26} />}
                                        >
                                            <div className="flex flex-col">
                                                {q.estado === "creando" && (
                                                    <button
                                                        onClick={() => handleResume(q._id)}
                                                        className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 p-2 text-white w-full cursor-pointer transition-colors duration-200"
                                                    >
                                                        <FaClipboardList size={24} />
                                                        <span className="text-lg font-semibold">Reanudar</span>
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/questionary/analytics/${q._id}`}
                                                    className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200"
                                                >
                                                    <FaRegChartBar size={24} />
                                                    <span className="text-lg font-semibold">Estadísticas</span>
                                                </Link>

                                                <button
                                                    onClick={() => handleOpenModal(q._id)}
                                                    className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200 cursor-pointer"
                                                >
                                                    <FaPenToSquare size={24} />
                                                    <span className="text-lg font-semibold ">Editar</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(q._id)}
                                                    className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200 cursor-pointer"
                                                >
                                                    <FaCopy size={24} />
                                                    <span className="text-lg font-semibold ">Duplicar</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setDeleteIds([q._id]);
                                                        setConfirmModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-3 bg-red-500 hover:bg-red-600 active:bg-red-700 p-2 text-white w-full cursor-pointer transition-colors duration-200"
                                                >
                                                    <FaRegTrashCan size={24} />
                                                    <span className="text-lg font-semibold">Borrar</span>
                                                </button>
                                            </div>
                                        </DropdownMenu>
                                    )}
                                />
                            </div>
                            {questionnaires.length > questionnairesPerPage && (
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
            <QuestionaryModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setIsResuming(false);
                    setResumeId(null);
                }}
                onSave={fetchQuestionnaires}
                resumeId={resumeId}
                isResuming={isResuming}
            />

            <QuestionaryEditModal
                id={selectedId || ""}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                }}
                onSave={fetchQuestionnaires}
            />
            <Title>Cuestionarios</Title>
        </div>
    );
}