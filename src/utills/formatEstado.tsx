export const formatEstado = (estado: string) => {
    let colorClass = "";

    switch (estado.toLowerCase()) {
        case "en espera":
            colorClass = "text-yellow-600 dark:text-yellow-400 font-semibold";
            break;

        case "activo":
            colorClass = "text-green-600 dark:text-green-400 font-semibold";
            break;

        case "cerrado":
            colorClass = "text-red-600 dark:text-red-400 font-semibold";
            break;

        default:
            colorClass = "text-gray-600 dark:text-zinc-400 font-semibold";
            break;
    }

    const text = estado.charAt(0).toUpperCase() + estado.slice(1);
    return { text, className: colorClass };
};