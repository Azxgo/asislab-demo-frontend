import { FaMagnifyingGlass } from "react-icons/fa6";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="w-full md:max-w-lg">
            <div className="flex gap-4 items-center">
                <FaMagnifyingGlass size={24} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellidos o correo..."
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        //setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600
                    bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100
                    focus:outline-none focus:ring-2 "
                />
            </div>
        </div>
    )
}