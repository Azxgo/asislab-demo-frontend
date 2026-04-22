import type React from "react"
import { Spinner } from "../visuals/Spinner"

interface Column<T> {
    key: string
    label: string
    render?: (row: T) => React.ReactNode
    className?: string

    width?: string
}

interface WorkersTableProps<T> {
    data: T[]
    columns: Column<T>[]

    rowKey: (row: T) => string

    onRowClick?: (row: T) => void

    selectable?: boolean
    selected?: Record<string, boolean>
    onSelectChange?: (selected: Record<string, boolean>) => void

    loading?: boolean
    emptyMessage?: string
}

export function WorkersTable<T>({
    data,
    columns,
    rowKey,
    onRowClick,
    selectable,
    selected = {},
    onSelectChange,
    loading,
    emptyMessage = "Sin datos" }: WorkersTableProps<T>) {

    const toggleAll = (checked: boolean) => {
        const newSelected: Record<string, boolean> = {}
        data.forEach((row) => {
            newSelected[rowKey(row)] = checked
        })
        onSelectChange?.(newSelected)
    }

    const toggleOne = (id: string) => {
        onSelectChange?.({
            ...selected,
            [id]: !selected[id],
        })
    }

    const gridTemplate = selectable
        ? `40px ${columns.map(c => c.width ?? "1fr").join(" ")}`
        : columns.map(c => c.width ?? "1fr").join(" ")

    if (loading) return <p className="flex items-center justify-center"><Spinner/></p>

    if (!data.length) return <p className="text-center py-8">{emptyMessage}</p>;

    return (
        <div
            className="overflow-x-auto rounded-lg ${className}"
        >
            <div className="grid bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700
            font-medium select-none items-center"
                style={{ gridTemplateColumns: gridTemplate }}
            >
                {selectable && (
                    <div className="hidden md:flex justify-center items-center px-2 py-3 ">
                        <input
                            type="checkbox"
                            checked={data.length > 0 && data.every(r => selected[rowKey(r)])}
                            onChange={(e) => toggleAll(e.target.checked)}
                        />
                    </div>
                )}

                {columns.map((col) => (
                    <div key={col.key} className="px-2 py-3">
                        {col.label}
                    </div>
                ))}
            </div>

            {/* Elementos */}

            {data.map((row) => (
                <div
                    key={rowKey(row)}
                    onClick={() => onRowClick?.(row)}
                    className="grid hover:bg-gray-50 dark:hover:bg-zinc-700/50
                    transition-colors duration-200 border-b border-gray-100 dark:border-zinc-700 cursor-pointer"
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {selectable && (
                        <div className="hidden md:flex justify-center items-center px-2 py-3 ">
                            <input
                                type="checkbox"
                                checked={!!selected[rowKey(row)]}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleOne(rowKey(row))}
                            />
                        </div>
                    )}
                    {columns.map((col) => (
                        <div key={col.key} className={`px-2 py-3 ${col.className ?? ""}`}>
                            {col.render ? col.render(row) : (row as any)[col.key]}
                        </div>
                    ))}

                </div>
            ))}
        </div>

    )
}