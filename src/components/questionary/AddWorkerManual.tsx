import { useState } from "react";
import type { Worker } from "../../types/workers";

interface AddWorkerManualProps {
    onAddWorker: (worker: Worker) => void;
    onCancel?: () => void;
}

export function AddWorkerManual({ onAddWorker }: AddWorkerManualProps) {
    // Estado que guarda el trabajador
    const [worker, setWorker] = useState<Worker>({
        id: "",
        rut: "",
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        fechaIngreso: "",
        cumpleaños: ""
    });

    // Estado de Error
    const [error, setError] = useState("")

    const [errors, setErrors] = useState({
        id: false,
        rut: false,
        nombres: false,
        apellido_paterno: false,
        apellido_materno: false,
        email: false,
        fechaIngreso: false,
        cumpleaños: false
    })

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const validateDate = (fecha: string) => {
        if (!fecha) return
        const date = new Date(fecha);
        return !isNaN(date.getTime());
    }

    const capitalizeFirst = (value: string) => {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    const lowerEmail = (value: string) => value.toLowerCase();

    // Función que agrega trabajador
    const handleAddRow = () => {
        const newErrors: any = {};

        Object.keys(worker).forEach((key) => {
            if (key === "id") return;

            const value = worker[key as keyof Worker];

            newErrors[key] =
                value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === "");
        });

        if (!newErrors.email) {
            if (!validateEmail(worker.email)) {
                newErrors.email = true;
                setError("El email no es válido");
                setErrors(newErrors);
                return;
            }
        }

        // Validación fecha ingreso
        if (!newErrors.fechaIngreso) {
            if (!validateDate(worker.fechaIngreso)) {
                newErrors.fechaIngreso = true;
                setError("La fecha de ingreso no es válida");
                setErrors(newErrors);
                return;
            }
        }

        // Validación cumpleaños
        if (!newErrors.cumpleaños) {
            if (!validateDate(worker.cumpleaños)) {
                newErrors.cumpleaños = true;
                setError("La fecha de cumpleaños no es válida");
                setErrors(newErrors);
                return;
            }
        }

        setErrors(newErrors)

        const hasErrors = Object.values(newErrors).some(val => val === true)
        if (hasErrors) {
            setError("Hay campos incompletos")
            return
        }

        onAddWorker(worker);

        setWorker({
            id: "",
            rut: "",
            nombres: "",
            apellido_paterno: "",
            apellido_materno: "",
            email: "",
            fechaIngreso: "",
            cumpleaños: ""
        });

        setErrors({
            id: false,
            rut: false,
            nombres: false,
            apellido_paterno: false,
            apellido_materno: false,
            email: false,
            fechaIngreso: false,
            cumpleaños: false
        });

        setError("")
    };

    return (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-600 p-2 bg-zinc-900">
            {error && <p className="text-red-400 px-2 font-semibold">{error}</p>}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 table-auto">
                <thead>
                    <tr className="text-left bg-gray-50 dark:bg-zinc-900">
                        <th className="px-4 py-2 font-medium">RUT</th>
                        <th className="px-4 py-2 font-medium">Nombres</th>
                        <th className="px-4 py-2 font-medium">Apellido Paterno</th>
                        <th className="px-4 py-2 font-medium">Apellido Materno</th>
                        <th className="px-4 py-2 font-medium">Email</th>
                        <th className="px-4 py-2 font-medium">Fecha de Ingreso</th>
                        <th className="px-4 py-2 font-medium">Fecha de Nacimiento</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                    <tr className="bg-white dark:bg-zinc-800  transition-colors duration-150">

                        {/* RUT */}
                        <td className="px-4 py-2">
                            <input
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.rut ? "border-red-500" : "border-gray-400 dark:border-zinc-400 "}`}
                                value={worker.rut}
                                onChange={e => setWorker(prev => ({ ...prev, rut: capitalizeFirst(e.target.value) }))}
                            />
                        </td>

                        {/* Nombres */}
                        <td className="px-4 py-2">
                            <input
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.nombres ? "border-red-500" : "border-gray-400 dark:border-zinc-400 "}`}
                                value={worker.nombres}
                                onChange={e => setWorker(prev => ({ ...prev, nombres: capitalizeFirst(e.target.value) }))}
                            />
                        </td>

                        {/* Apellido paterno */}
                        <td className="px-4 py-2">
                            <input
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.apellido_paterno ? "border-red-500" : "border-gray-400 dark:border-zinc-400 "}`}
                                value={worker.apellido_paterno}
                                onChange={e => setWorker(prev => ({ ...prev, apellido_paterno: capitalizeFirst(e.target.value) }))}
                            />
                        </td>

                        {/* Apellido materno */}
                        <td className="px-4 py-2">
                            <input
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.apellido_materno ? "border-red-500" : "border-gray-400 dark:border-zinc-400 "}`}
                                value={worker.apellido_materno}
                                onChange={e => setWorker(prev => ({ ...prev, apellido_materno: capitalizeFirst(e.target.value) }))}
                            />
                        </td>

                        {/* Email */}
                        <td className="px-4 py-2">
                            <input
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.email ? "border-red-500" : "border-gray-400 dark:border-zinc-400 "}`}
                                value={worker.email}
                                onChange={e => setWorker(prev => ({ ...prev, email: lowerEmail(e.target.value) }))}
                            />
                        </td>

                        {/* Fecha ingreso */}
                        <td className="px-4 py-2">
                            <input
                                type="date"
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none dark:bg-zinc-800 dark:text-zinc-100
                                    ${errors.fechaIngreso ? "border-red-500" : "border-gray-400 dark:border-zinc-400"}`}
                                value={worker.fechaIngreso}
                                onChange={e => setWorker(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                            />
                        </td>

                        {/* Cumpleaños */}
                        <td className="px-4 py-2">
                            <input
                                type="date"
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none 
                                    ${errors.cumpleaños ? "border-red-500" : "border-gray-400 dark:border-zinc-400"}`}
                                value={worker.cumpleaños}
                                onChange={e => setWorker(prev => ({ ...prev, cumpleaños: e.target.value }))}
                            />
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={7} className="text-right py-2">
                            <button onClick={handleAddRow} className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-md shadow transition">
                                Agregar fila
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
