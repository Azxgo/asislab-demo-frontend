import axios from "axios"
import Cookies from "js-cookie";
import type { Worker } from "../types/workers";
import { AnimatePresence, motion } from "framer-motion";
import { Title } from "react-head";
import { useState, useEffect } from "react"
import { FaEllipsis, FaRegTrashCan, FaPenToSquare, FaUserPlus, FaMagnifyingGlass } from "react-icons/fa6"
import { DropdownMenu } from "../components/DropdownMenu"
import { Spinner } from "../components/visuals/Spinner"
import { WorkerModal } from "../components/WorkerModal"
import { ConfirmModal } from "../components/questionary/ConfirmModal";
import { Toast } from "../components/visuals/Toast";
import { calculateAge } from "../utills/calculateAge";
import { OpenModalButton } from "../components/OpenModalButton";
import { formatDate } from "../utills/formatDate";
import { BulkBar } from "../components/BulkBar";
import { IndexPagesTable } from "../components/ui/IndexPagesTable";

export default function Workers() {
    // Trabajadores
    const [workers, setWorkers] = useState<Worker[]>([])
    // Abrir menu de acciones
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    // Estados para guardar id y abrir modal para agregar / editar
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false)
    // Estados que guardan ids en seleccion y borrado.
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const workersPerPage = 30;
    // Busquede
    const [searchTerm, setSearchTerm] = useState("")
    // Estados para abrir ConfirmModal y Toast
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // Estados de error y cargado
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Funcion para llamar a los trabajadores
    const fetchWorkers = async () => {
        setLoading(true)
        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados.
            const csrfToken = Cookies.get("csrf_access_token");
            const res = await axios.get<{ workers: Worker[] }>(
                "http://localhost:5000/workers/getAll",
                // Importante
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            );
            // Guarda los trabajadores en el estado.
            setWorkers(res.data.workers)
        } catch (err) {
            console.error("Error al obtener trabajadores:", err)
            setError("No se pudieron cargar los trabajadores.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWorkers()
    }, [])


    // Guarda las ids los elementos seleccionados en el estado.
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    }

    // Guarda todos los elementos en el estado
    const toggleSelectAll = () => {
        if (selectedIds.length === workers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(workers.map(w => w.id).filter((id): id is string => Boolean(id)));
        }
    };

    // Funcion para borrar trabajadores
    const handleDelete = async () => {
        if (deleteIds.length === 0) return;
        setConfirmModalOpen(false);

        try {
            // Importante: Enviar la csrf_access_token para usuarios iniciados
            const csrfToken = Cookies.get("csrf_access_token");
            // Hace un map con todas las id guardadas en el estado, llamando al endpoint de borrar.
            // Todas las ejecuciones se hacen en paralelo por Promise.all
            await Promise.all(
                deleteIds.map((id) =>
                    axios.delete(`http://localhost:5000/workers/delete/${id}`, {
                        // Importante
                        headers: { "X-CSRF-TOKEN": csrfToken, },
                        withCredentials: true,
                    })
                )
            );

            fetchWorkers()

            // Dependiendo si fue un trabajador eliminado o mas de uno, 
            // el mensaje que aparece en el toast es distinto
            setToast({
                message:
                    deleteIds.length === 1
                        ? "El Trabajador y todos sus datos fueron eliminados."
                        : `${deleteIds.length} trabajadores fueron eliminados.`,
                type: "success",
            });
        } catch (err) {
            console.error(err);
            setToast({
                message: "No se pudieron eliminar los trabajadores.",
                type: "error",
            });
        } finally {
            setDeleteIds([]);
            setSelectedIds([]);
        }
    }

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

    const filteredWorkers = workers.filter((w: any) =>
        w.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.apellido_paterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.apellido_materno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const indexOfLastWorker = currentPage * workersPerPage;
    const indexOfFirstWorker = indexOfLastWorker - workersPerPage
    const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker)
    const totalPages = Math.ceil(filteredWorkers.length / workersPerPage)

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
        <div className="flex flex-col rounded-lg p-4 sm:p-6 md:p-8 lg:p-8 min-h-50
         border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[900px]">
            <div className="flex flex-col gap-2">
                {/* Boton para agregar Trabajadores */}
                <OpenModalButton
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaUserPlus size={22} />
                    Agregar Usuario
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
                                    data={currentWorkers}
                                    rowKey={(w) => w.id}
                                    loading={loading}
                                    selectable
                                    selected={selectedIds}
                                    onSelectChange={setSelectedIds}
                                    emptyMessage="No existen Trabajadores"

                                    columns={[
                                        { key: "rut", label: "RUT", width: "1fr" },
                                        { key: "nombres", label: "Nombres", width: "1fr" },
                                        { key: "apellido_paterno", label: "Apellido Paterno", width: "1fr" },
                                        { key: "apellido_materno", label: "Apellido Materno", width: "1fr" },
                                        { key: "email", label: "Email", className: "", width: "2fr" },
                                        {
                                            key: "fechaIngreso",
                                            label: "Fecha Ingreso",
                                            render: (w) => formatDate(w.fechaIngreso),
                                            className: "hidden md:block",
                                            width: "1fr"
                                        },
                                        {
                                            key: "edad",
                                            label: "Fecha Nacimiento",
                                            render: (w) => formatDate(w.cumpleaños),
                                            className: "hidden md:block",
                                            width: "1fr"
                                        },
                                    ]}

                                    renderActions={(w) => (
                                        <DropdownMenu
                                            isOpen={openMenuId === w.id}
                                            onToggle={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                                            label={<FaEllipsis size={20} />}
                                        >
                                            <button
                                                onClick={() => handleOpenModal(w.id)}
                                                className="flex items-center gap-3 p-2 rounded-md
                                                                        text-gray-800 dark:text-zinc-100
                                                                        hover:bg-gray-100 dark:hover:bg-zinc-700
                                                                        transition-all duration-200 cursor-pointer"
                                            >
                                                <FaPenToSquare size={24} />
                                                <span className="text-lg font-semibold">Editar</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteIds([w.id]);
                                                    setConfirmModalOpen(true);
                                                }}
                                                className="flex items-center gap-3 bg-red-500 hover:bg-red-600 active:bg-red-700 p-2 text-white w-full cursor-pointer transition-colors duration-200"
                                            >
                                                <FaRegTrashCan size={24} />
                                                <span className="text-lg font-semibold">Borrar</span>
                                            </button>
                                        </DropdownMenu>

                                    )}
                                />
                            </div>

                            {workers.length > workersPerPage && (
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
                                                    focus:outline-none focus:ring-2 "
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
            <WorkerModal
                id={selectedId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={fetchWorkers}
                setToast={setToast}
            />
            <Title>Trabajadores</Title>
        </div>
    )
}