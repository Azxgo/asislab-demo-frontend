import { parseISO, format, isValid } from "date-fns";

export function groupByPeriod(workers: any[] = []) {
  const grouped: Record<string, { periodo: string; count: number }> = {};

  workers.forEach(worker => {
    if (!worker.fechaIngreso) return;
    const date = parseISO(worker.fechaIngreso);
    if (!isValid(date)) return;

    const key = format(date, "yyyy-MM");

    if (!grouped[key]) grouped[key] = { periodo: key, count: 0 };
    grouped[key].count += 1;
  });

  return Object.values(grouped).sort((a, b) => a.periodo.localeCompare(b.periodo));
}