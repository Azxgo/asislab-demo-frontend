import type { ReactNode } from "react";

type IndexButtonProps = {
    children: ReactNode;
};

export function IndexButton({ children }: IndexButtonProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 justify-center items-center rounded-lg
                        border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 font-semibold 
                        bg-gray-50 dark:bg-zinc-700
                        hover:bg-gray-100 dark:hover:bg-zinc-600 active:scale-95 transition">

            {children}
        </div>
    )
}