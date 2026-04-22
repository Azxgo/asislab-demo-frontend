export const normalizeRut = (rut: string) =>
    rut.replace(/\./g, "").replace(/-/g, "").toLowerCase();