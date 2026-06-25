import { FaRegTrashCan } from "react-icons/fa6";

type BulkBarProps = {
  count: number;
  onDelete: () => void;
};

export function BulkBar({ count, onDelete }: BulkBarProps) {
  return (
    <div
      className="flex w-full mb-2 px-4 py-2 rounded-md justify-between items-center
      bg-blue-100 dark:bg-gray-500/30 overflow-hidden"
    >
      <p className="text-lg font-semibold select-none">
        {count} {count === 1 ? "Elemento" : "Elementos"} seleccionado{count === 1 ? "" : "s"}
      </p>

      <button
        onClick={onDelete}
        className="text-white px-4 py-2 rounded-md cursor-pointer
        bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
      >
        <FaRegTrashCan size={24} />
      </button>
    </div>
  );
}