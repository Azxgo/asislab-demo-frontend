import { useEffect, useState } from "react";
import { FaXmark, FaUpload, FaUserPlus, FaTrash, FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import * as XLSX from "xlsx";
import type { Worker } from "../../types/workers";
import { AddWorkerManual } from "./AddWorkerManual";
import { AnimatePresence, motion } from "framer-motion";
import { Toast } from "../visuals/Toast";
import { Spinner } from "../visuals/Spinner";
import { LoadingDots } from "../visuals/LoadingDots";
import { formatDate } from "../../utills/formatDate";
import { WorkersTable } from "../ui/WorkersTable";
import apiClient from "../../config/apiClient";

interface WorkersListProps {
    id: string;
    area: string;
    isOpen: boolean;
    onClose: () => void;
}

type WorkerWithNew = Worker & { isNew?: boolean };

export function AddWorkers({ id, area, isOpen, onClose }: WorkersListProps) {
    const [workers, setWorkers] = useState<WorkerWithNew[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [selectedWorkers, setSelectedWorkers] = useState<{ [id: string]: boolean }>({})
    const [showManualForm, setShowManualForm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [error, setError] = useState("")

    const [fetchedWorkers, setFetchedWorkers] = useState<Worker[]>([])

    const [searchTerm, setSearchTerm] = useState("")

    const [mode, setMode] = useState('group')

    const [loading, setLoading] = useState(true)
    const [workersLoading, setWorkersLoading] = useState(false)
    const [allWorkersLoaded, setAllWorkersLoaded] = useState(false)

    const fetchWorkersId = async (id: string) => {
        try {
            const res = await apiClient.get(`/workers/getAllById/${id}`);
            setWorkers(res.data.workers);
        } catch (err) {
            console.error(err);
            setToast({
                message: "Error al agregar los trabajadores.",
                type: "error",
            });
        } finally {
            setLoading(false)
        }
    };

    const fetchWorkers = async () => {
        setAllWorkersLoaded(true)
        try {
            const res = await apiClient.get<{ workers: Worker[] }>(
                "/workers/getAll",
                // Importante
                {
                }
            );

            setFetchedWorkers(res.data.workers)
        } catch (err) {
            console.error("Error al obtener trabajadores:", err)
            setError("No se pudieron cargar los trabajadores.")
        } finally {
            setAllWorkersLoaded(false)
        }
    }

    useEffect(() => {
        if (!isOpen) return

        fetchWorkersId(id)
        fetchWorkers()
    }, [isOpen, id])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleUploadExcel = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;

            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: Worker[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const cleanedData = jsonData.map(w => ({
                ...w,
                rut: w.rut?.trim() || "",
                nombres: w.nombres?.trim() || "",
                apellido_paterno: w.apellido_paterno?.trim() || "",
                apellido_materno: w.apellido_materno?.trim() || "",
                email: w.email?.trim().toLowerCase() || "",
                fechaIngreso: w.fechaIngreso?.trim() || "",
                cumpleaños: w.cumpleaños?.trim() || ""
            }));

            setWorkers(prev => {
                const existingEmails = new Set(prev.map(w => w.email));
                const filteredNewWorkers = cleanedData.filter(w => !existingEmails.has(w.email));
                const newWorkers = [...prev, ...filteredNewWorkers];


                setSelectedWorkers(prevSelected => {
                    const updated = { ...prevSelected };

                    filteredNewWorkers.forEach(w => {
                        updated[w.id] = true;
                    });

                    return updated;
                });

                return newWorkers;
            });
        };
        reader.readAsArrayBuffer(file);
    };

    const prepareUsersForUpload = (workers: Worker[]) => workers.map(worker => ({
        rut: worker.rut,
        nombres: worker.nombres,
        apellido_paterno: worker.apellido_paterno,
        apellido_materno: worker.apellido_materno,
        nombre_completo: `${worker.nombres} ${worker.apellido_paterno} ${worker.apellido_materno}`,
        email: worker.email,
        password: "123",
        fechaIngreso: worker.fechaIngreso,
        cumpleaños: worker.cumpleaños,
        rol: "trabajador",
        area: area
    }));

    const handleAddWorkers = async () => {

        const workersToAdd = workers.filter(w => selectedWorkers[w.id] && (w.isNew ?? true));
        if (workersToAdd.length === 0) {
            setError("No hay trabajadores seleccionados");
            return;
        }
        setWorkersLoading(true)
        setError("");

        const usersToUpload = prepareUsersForUpload(workersToAdd);

        try {
            const res = await apiClient.post(
                `/workers/upload/${id}`,
                { users: usersToUpload },
                {}
            );

            setToast({
                message: `Usuarios agregados: ${res.data.added_users}. Total en cuestionario: ${res.data.total_workers_in_questionary}`,
                type: "success",
            });

            // Marcar los trabajadores como ya existentes
            setWorkers(prev => prev.map(w => ({ ...w, isNew: false })));
            setSelectedWorkers({});

            setFile(null);
        } catch (err) {
            console.error(err);
            setToast({ message: "Error al agregar los trabajadores.", type: "error" });
        } finally {
            setWorkersLoading(false)
            setLoading(false)
        }
    };

    const handleRemoveWorkers = async () => {
        const workersToRemove = workers.filter((w) => selectedWorkers[w.id]);
        if (workersToRemove.length === 0) {
            setError("No hay trabajadores seleccionados para borrar");
            return
        }

        setWorkersLoading(true)
        setError("")
        try {
            const res = await apiClient.post(`/workers/removeFromQuestionary/${id}`, {
                worker_ids: workersToRemove.map(worker => worker.id)
            }, {

            });

            setToast({
                message: `Trabajadores borrados: ${res.data.removed_count}`,
                type: "success",
            });
            setWorkers(prev =>
                prev.filter(w => !selectedWorkers[w.id])
            );
            setSelectedWorkers({});
        } catch (err) {
            console.error(err);
            setToast({
                message: "Error al borrar trabajadores del cuestionario",
                type: "error",
            });
        } finally {
            setWorkersLoading(false)
        }
    };

    const handleAddManualWorker = (worker: Worker) => {
        if (workers.some(w => w.email === worker.email)) {
            return setError("Ya existe un trabajador con este email");
        }

        setWorkers(prev => [
            ...prev,
            { ...worker, isNew: true }
        ]);

        setSelectedWorkers(prev => ({
            ...prev,
            [workers.length]: true,
        }));

        setShowManualForm(false);
        setError("");
    };

    const handleAddOneWorker = async (workerId: string) => {
        const worker = fetchedWorkers.find((w) => w.id === workerId)
        if (!worker) return

        try {
            await apiClient.post(
                `/workers/assign/${id}`,
                { worker_id: workerId },
                {}
            );

            setToast({
                message: `Usuarios agregado=}`,
                type: "success",
            });

            setWorkers(prev => [...prev, { ...worker, isNew: false }])
        } catch (err) {
            console.error(err);
            setToast({ message: "Error al agregar los trabajadores.", type: "error" });
        }
    }

    const workersIdsInQuestionary = new Set(workers.map(w => w.id));

    const filteredWorkers = fetchedWorkers
        .filter(w => !workersIdsInQuestionary.has(w.id))
        .filter((w) =>
            w.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.apellido_paterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.apellido_materno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    //const indexOfLastWorker = currentPage * workersPerPage;
    //const indexOfFirstWorker = indexOfLastWorker - workersPerPage
    //const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker)
    //const totalPages = Math.ceil(filteredWorkers.length / workersPerPage)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col bg-white dark:bg-zinc-800 gap-3 p-4 sm:p-6 rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>

                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold">Gestionar Participantes</h2>
                            <button
                                className="hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                                onClick={onClose}
                            >
                                <FaXmark size={20} />
                            </button>
                        </div>
                        <div className="flex w-fit rounded-lg 
                                    border border-gray-200 dark:border-zinc-600">
                            <button
                                type="button"
                                onClick={() => setMode("group")}
                                className={`px-4 py-2 text-sm font-medium transition-all
                                                        ${mode === "group"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                Grupo
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("select")}
                                className={`px-4 py-2 text-sm font-medium transition-all
                                                        ${mode === "select"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                Seleccionar
                            </button>

                        </div>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <>
                                {mode === "group" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-4 flex flex-col gap-2">
                                            {error && <p className="font-semibold text-red-500 text-sm mb-1">{error}</p>}
                                            <div className="flex gap-2">

                                                <div className="flex w-full justify-between gap-2">
                                                    <div className="flex gap-2">
                                                        {/* Input para subir archivo .xlsx */}
                                                        <label className="flex items-center gap-2 px-10 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M4 3h12v12H4z" />
                                                            </svg>
                                                            <span className="">{file ? file.name : "Selecciona un archivo Excel"}</span>
                                                            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                                                        </label>
                                                        <button onClick={handleUploadExcel} className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md cursor-pointer font-semibold">
                                                            <FaUpload />
                                                            Subir
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setShowManualForm(prev => !prev)}
                                                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md cursor-pointer font-semibold">

                                                        {showManualForm ?
                                                            <>
                                                                <FaXmark size={20} />
                                                                <p>Cancelar</p>
                                                            </>
                                                            :
                                                            <>
                                                                <FaUserPlus size={20} />
                                                                <p>Agregar manualmente</p>
                                                            </>
                                                        }
                                                    </button>
                                                </div>

                                            </div>
                                            <div>
                                                <p className="text-sm">*Solo se aceptan formatos .xlsx</p>
                                            </div>

                                        </div>

                                        <div className="overflow-x-auto rounded-lg">
                                            {/* Form para agregar un usuario manualmente */}
                                            <AnimatePresence>
                                                {showManualForm && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                                                        animate={{ height: "auto", opacity: 1, paddingTop: 0, paddingBottom: 0 }}
                                                        exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                                        className="overflow-hidden rounded-b-md"
                                                    >
                                                        <AddWorkerManual
                                                            onAddWorker={handleAddManualWorker}
                                                            onCancel={() => setShowManualForm(false)}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="max-h-[400px] overflow-y-auto border border-gray-200 dark:border-zinc-600 rounded-lg">
                                                <WorkersTable
                                                    data={workers}
                                                    rowKey={(w) => w.id}
                                                    loading={allWorkersLoaded}
                                                    selectable
                                                    selected={selectedWorkers}
                                                    onSelectChange={setSelectedWorkers}
                                                    emptyMessage="No hay trabajadores"

                                                    columns={[
                                                        { key: "rut", label: "RUT", width: "1fr" },
                                                        { key: "nombres", label: "Nombres", width: "1fr" },
                                                        { key: "apellido_paterno", label: "Apellido Paterno", width: "1fr" },
                                                        { key: "apellido_materno", label: "Apellido Materno", width: "1fr" },
                                                        { key: "email", label: "Email", width: "2fr" },
                                                        { key: "fechaIngreso", label: "Fecha Ingreso", render: (w) => formatDate(w.fechaIngreso), width: "1fr" },
                                                        { key: "cumpleaños", label: "Fecha Nacimiento", render: (w) => formatDate(w.cumpleaños), width: "1fr" },
                                                    ]}
                                                />
                                            </div>

                                        </div>

                                        {/* Botones para agregar o borrar */}
                                        <div className="flex items-center gap-2 mt-4">
                                            <button
                                                onClick={handleAddWorkers}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md cursor-pointer font-semibold"
                                            >
                                                <FaPlus />
                                                {workers.filter((w) => selectedWorkers[w.id]).length > 1

                                                    ? "Agregar seleccionados"
                                                    : "Agregar"}
                                            </button>

                                            <button
                                                onClick={handleRemoveWorkers}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-md cursor-pointer font-semibold"
                                            >
                                                <FaTrash />
                                                {workers.filter((w) => selectedWorkers[w.id]).length > 1
                                                    ? "Borrar seleccionados"
                                                    : "Borrar"}
                                            </button>
                                            {workersLoading && (
                                                <div className="flex gap-2">
                                                    <div className="animate-spin border-2 border-zinc-400 border-t-transparent rounded-full w-4 h-4" />
                                                    <LoadingDots isLoading={workersLoading} />
                                                </div>
                                            )
                                            }

                                        </div>
                                    </motion.div>
                                )}

                                {mode === "select" && (
                                    <>
                                        <div>
                                            <div className="w-full md:max-w-lg">
                                                <div className="flex gap-4 items-center">
                                                    <FaMagnifyingGlass size={24} />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar por nombre, apellidos o correo..."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                        }}
                                                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600
                                                        bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100
                                                        focus:outline-none focus:ring-2 "
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto border border-gray-200 dark:border-zinc-600 rounded-lg">
                                            <WorkersTable
                                                data={filteredWorkers}
                                                rowKey={(w) => w.id}
                                                onRowClick={(w) => handleAddOneWorker(w.id)}
                                                emptyMessage="No hay trabajadores disponibles"
                                                columns={[
                                                    { key: "rut", label: "RUT", width: "1fr" },
                                                    { key: "nombres", label: "Nombres", width: "1fr" },
                                                    { key: "apellido_paterno", label: "Apellido Paterno", width: "1fr" },
                                                    { key: "apellido_materno", label: "Apellido Materno", width: "1fr" },
                                                    { key: "email", label: "Email", className: "hidden md:block", width: "2fr" },
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
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>

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
                </motion.div>
            )
            }

        </AnimatePresence >
    );
}