import type { ReactNode } from "react";

type QuestionaryButtonProps = {
    children: ReactNode;
    onClick: () => void;
};

export function QuestionaryButton({ children, onClick }: QuestionaryButtonProps) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col w-full sm:flex-row gap-2 sm:gap-3 p-2 justify-center items-center rounded-lg
                        border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 font-semibold 
                        bg-gray-50 dark:bg-zinc-700 cursor-pointer
                        hover:bg-gray-100 dark:hover:bg-zinc-600 transition-all duration-300 active:scale-95">

            {children}
        </div>
    )
}