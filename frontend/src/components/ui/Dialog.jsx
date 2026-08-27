import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Button } from "./Button";

export function Dialog({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 shadow-[var(--shadow-float)]"
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]">{title}</h3>
              <Button onClick={onClose} size="icon" type="button" variant="ghost">
                <FiX size={18} />
              </Button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
