import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Sí, borrar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-sm w-full p-6 rounded-xl shadow-xlbg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">{title}</h3>
            {description && <p className="text-gray-600 dark:text-zinc-300 text-base mb-4">{description}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg font-semibold
                  bg-gray-200 dark:bg-zinc-700
                  text-gray-800 dark:text-zinc-100
                  hover:bg-gray-300 dark:hover:bg-zinc-600
                  transition cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg font-semibold
                  bg-red-500 hover:bg-red-600
                  text-white
                  transition cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
