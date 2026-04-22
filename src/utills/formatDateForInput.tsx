export const formatDateForInput = (dateInput: any) => {
    if (!dateInput) return "";

    const raw = dateInput?.$date || dateInput;

    const date = new Date(raw);
    if (isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);

    return date.toISOString().split("T")[0];
};