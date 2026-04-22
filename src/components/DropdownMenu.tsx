import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

interface DropDownMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    label: ReactNode;
    children: ReactNode;
}

export function DropdownMenu({ isOpen, onToggle, label, children }: DropDownMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onToggle();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onToggle]);


    return (
        <div ref={menuRef} className="relative">
            <button onClick={onToggle}
                className="cursor-pointer text-lg px-3 py-1 rounded-md
                    text-gray-800 dark:text-zinc-100
                    hover:bg-gray-100 dark:hover:bg-zinc-700
                    transition-all duration-300">
                {label}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 transform -translate-x-1/2 mt-2
                            bg-white dark:bg-zinc-800
                            border border-gray-200 dark:border-zinc-500
                            rounded-md z-10 shadow-md
                            max-h-50 overflow-y-auto w-48"
                    >
                        <ul className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {children}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}