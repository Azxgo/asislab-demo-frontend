import { motion } from "framer-motion";

interface SingleOptionProps {
    label: string
    text: string
    selected: boolean
    onSelect?: () => void

}

export function SingleOption({ label, text, selected, onSelect }: SingleOptionProps) {
    let labelDisplay = `${label})`;

    return (
        <motion.div
            onClick={onSelect}
            whileTap={{ scale: 0.99 }}  // 🔹 animación rápida al hacer click
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 items-center px-2 py-4 select-none cursor-pointer
                rounded-md transition-colors duration-150
                text-gray-800 dark:text-zinc-100
                ${selected
                    ? "bg-zinc-200 dark:bg-zinc-700"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-600"}`}
        >
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl">{labelDisplay}</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl">{text}</p>
        </motion.div>
    );
}