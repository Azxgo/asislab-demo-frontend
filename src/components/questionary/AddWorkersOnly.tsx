import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaUpload } from "react-icons/fa";
import * as XLSX from "xlsx";
import type { Worker } from "../../types/workers";
import { useEffect, useState } from "react";
import { LoadingDots } from "../visuals/LoadingDots";
import { WorkersTable } from "../ui/WorkersTable";
import { formatDate } from "../../utills/formatDate";

interface Props {
    onWorkersAdded: () => void;
    setToast: React.Dispatch<
        React.SetStateAction<{ message: string; type: "success" | "error" } | null>
    >;
}

export function AddWorkersOnly({ onWorkersAdded, setToast }: Props) {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [selectedWorkers, setSelectedWorkers] = useState<{ [id: string]: boolean }>({})

    const [area, setArea] = useState("");
    const [areasList, setAreasList] = useState<{ _id: string, nombre: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

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
        setLoading(true)
        const workersToAdd = workers.filter(w => selectedWorkers[w.id])
        if (workersToAdd.length === 0) {
            setError("No hay trabajadores seleccionados");
            setLoading(false);
            return;
        }
        setError("");

        if (!area) {
            setError("Debe seleccionar un área");
            setLoading(false);
            return;
        }

        const usersToUpload = prepareUsersForUpload(workersToAdd);

        try {
            const csrfToken = Cookies.get("csrf_access_token");
            const res = await axios.post(
                `http://localhost:5000/workers/addBatch`,
                { users: usersToUpload },
                { headers: { "X-CSRF-TOKEN": csrfToken }, withCredentials: true }
            );

            setToast({
                message: `Usuarios creados: ${res.data.created_users}`,
                type: "success",
            });

            onWorkersAdded();

            // Marcar los trabajadores como ya existentes
            setWorkers(prev => prev.map(w => ({ ...w, isNew: false })));
            setSelectedWorkers({});

            setFile(null);
        } catch (err) {
            console.error(err);
            setToast({ message: "Error al agregar los trabajadores.", type: "error" });
        } finally {
            setLoading(false)
        }
    };

    const fetchAreasList = async () => {
        try {
            const res = await axios.get("http://localhost:5000/areas/getAll");
            setAreasList(res.data.areas);
        } catch (err) {
            console.error("Error al cargar áreas:", err);
        }
    };

    useEffect(() => {
        fetchAreasList()
    }, [])

    return (
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
                                <input type="file" className="hidden" accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <button
                                onClick={handleUploadExcel}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md cursor-pointer font-semibold">
                                <FaUpload />
                                Subir
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <label className="font-medium">Área</label>
                        <select
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="px-4 py-2 w-64 border border-gray-200 dark:border-zinc-400 rounded-lg
                                                dark:bg-zinc-800 dark:text-zinc-100"
                        >
                            <option value="">Seleccionar área</option>
                            {areasList.map((a) => (
                                <option key={a._id} value={a._id}>
                                    {a.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
                <div>
                    <p className="text-sm">*Solo se aceptan formatos .xlsx</p>
                </div>

            </div>

            <div className="max-h-[400px] overflow-y-auto border border-gray-200 dark:border-zinc-600 rounded-lg">
                <WorkersTable
                    data={workers}
                    rowKey={(w) => w.id}
                    loading={loading}
                    selectable
                    selected={selectedWorkers}
                    onSelectChange={(selected) => setSelectedWorkers(selected)}
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
                    //IMPORTANTE AQUI
                    //onClick={handleRemoveWorkers}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-md cursor-pointer font-semibold"
                >
                    <FaTrash />
                    {workers.filter((w) => selectedWorkers[w.id]).length > 1
                        ? "Borrar seleccionados"
                        : "Borrar"}
                </button>
                {loading && (
                    <div className="flex gap-2">
                        <div className="animate-spin border-2 border-zinc-400 border-t-transparent rounded-full w-4 h-4" />
                        <LoadingDots isLoading={loading} />
                    </div>
                )
                }

            </div>
        </motion.div>
    )
}