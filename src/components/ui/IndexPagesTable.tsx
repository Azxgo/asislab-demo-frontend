import { useEffect, useState } from "react"
import { Spinner } from "../visuals/Spinner"

interface Column<T> {
    key: string
    label: string
    render?: (row: T) => React.ReactNode
    className?: string

    width?: string
    hideOn?: "sm" | "md" | "lg"
}

interface IndexPagesTable<T> {
    data: T[]
    columns: Column<T>[]

    rowKey: (row: T) => string

    renderActions?: (row: T) => React.ReactNode

    selectable?: boolean
    selected?: string[]
    onSelectChange: (selected: string[]) => void
    loading?: boolean
    emptyMessage?: string
}

export function IndexPagesTable<T>({
    data,
    columns,
    rowKey,
    selectable,
    selected = [],
    onSelectChange,
    loading,
    renderActions,
    emptyMessage = "error"
}: IndexPagesTable<T>) {

    const [screen, setScreen] = useState<"sm" | "md" | "lg">("lg")

    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 640) setScreen("sm")
            else if (window.innerWidth < 1024) setScreen("md")
            else setScreen("lg")
        }

        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const visibleColumns = columns.filter(col => {
        if (!col.hideOn) return true

        if (col.hideOn === "sm" && screen === "sm") return false
        if (col.hideOn === "md" && screen === "md") return false
        if (col.hideOn === "lg" && screen === "lg") return false

        return true
    })

    const gridTemplate = `
    ${selectable ? "40px" : ""}
    ${visibleColumns.map(c => c.width ?? "minmax(0, 1fr)").join(" ")}
    ${renderActions ? "150px" : ""}
`

    const toggleAll = (checked: boolean) => {
        if (!onSelectChange) return

        if (checked) {
            onSelectChange(data.map(row => rowKey(row)))
        } else {
            onSelectChange([])
        }
    }

    const toggleOne = (id: string) => {
        if (!onSelectChange) return

        if (selected?.includes(id)) {
            onSelectChange(selected.filter(x => x !== id))
        } else {
            onSelectChange([...(selected || []), id])
        }
    }

    if (loading) return <p className="flex items-center justify-center"><Spinner /></p>

    if (!data.length) return <p className="text-center py-8">{emptyMessage}</p>;


    return (
        <div className="">
            <div className="grid bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700
            font-medium select-none items-center"
                style={{ gridTemplateColumns: gridTemplate }}
            >
                {selectable && (
                    <div className="flex justify-center items-center px-2 py-3 ">
                        <input
                            type="checkbox"
                            checked={data.length > 0 &&
                                data.every(r => selected?.includes(rowKey(r)))}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                    </div>
                )}

                {visibleColumns.map((col) => (
                    <div key={col.key} className={`px-1 sm:px-2 py-2 sm:py-3 text-base sm:text-lg font-medium select-none ${col.className ?? ""}`}>
                        {col.label}
                    </div>
                ))}

                {renderActions && (
                    <div className="px-1 sm:px-2 py-2 sm:py-3 text-base sm:text-lg font-medium select-none text-center">
                        Acciones
                    </div>
                )}
            </div>

            {data.map((row) => (
                <div
                    className="grid hover:bg-gray-50 dark:hover:bg-zinc-700/50
                    transition-colors duration-200 border-b border-gray-100 dark:border-zinc-700"
                    style={{ gridTemplateColumns: gridTemplate }}
                >
                    {selectable && (
                        <div className="flex justify-center items-center px-2 py-3 ">
                            <input
                                type="checkbox"
                                checked={selected?.includes(rowKey(row))}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleOne(rowKey(row))}
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        </div>
                    )}
                    {visibleColumns.map((col) => (
                        <div
                            key={col.key}
                            className={`flex items-center px-1 sm:px-2 py-2 sm:py-3 text-base sm:text-lg min-w-0 ${col.className ?? ""}`}
                        >
                            <div className="truncate w-full">
                                {col.render ? col.render(row) : (row as any)[col.key]}
                            </div>
                        </div>
                    ))}

                    {renderActions && (
                        <div
                            className="flex items-center justify-center px-2 py-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {renderActions(row)}
                        </div>
                    )}

                </div>
            ))}
        </div>
    )
}