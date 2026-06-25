import type { ReactNode } from "react";

type OpenModalButtonProps = {
    children: ReactNode;
    onClick: () => void;
};

export function OpenModalButton({ children, onClick }: OpenModalButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 px-6 py-3 
                        border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 
                        font-semibold rounded-lg
                        bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600
                        transition-all duration-200 cursor-pointer active:scale-95"
        >
            {children}
        </button>
    )
}