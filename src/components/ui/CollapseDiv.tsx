import { useEffect, useRef, useState } from "react"

type CollapseProps = {
    open: boolean
    children: React.ReactNode
    className?: string
}

export function CollapseDiv({ open, children, className = "" }: CollapseProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState("0px")

    const updateHeight = () => {
        if (ref.current) {
            setHeight(`${ref.current.scrollHeight}px`)
        }
    }

    useEffect(() => {
        if (open) {
            updateHeight()
        } else {
            setHeight("0px")
        }
    }, [open, children])

    return (
        <div
            style={{
                maxHeight: height,
                overflow: "hidden",
                opacity: open ? 1 : 0,
                transition: "max-height 0.7s ease, opacity 0.4s ease"
            }}
            className={`${className}`}
        >
            <div className="p-2 "ref={ref}>
                {children}
            </div>
        </div>
    )
}