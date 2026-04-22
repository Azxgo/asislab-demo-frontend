import { useEffect, useState } from "react";

interface LoadingDotsProps {
    isLoading: boolean;
    className?: string;
}

export function LoadingDots({ isLoading, className }: LoadingDotsProps) {
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!isLoading) {
            setDots("");
            return;
        }

        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <p className={className || "text-sm text-gray-600 dark:text-gray-300"}>
            Cargando{dots}
        </p>
    );
}