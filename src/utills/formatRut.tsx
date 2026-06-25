export const formatRut = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, "");
    if (clean.length <= 1) return clean

    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)

    return `${body}-${dv}`
}