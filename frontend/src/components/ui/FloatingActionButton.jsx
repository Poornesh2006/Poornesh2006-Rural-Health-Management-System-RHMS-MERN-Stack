import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

export function FloatingActionButton({ to, label }) {
  return (
    <Link
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full bg-[var(--color-brand)] px-5 py-4 text-sm font-semibold text-white shadow-[var(--shadow-float)] transition hover:translate-y-[-2px] hover:bg-[var(--color-brand-strong)]"
      to={to}
    >
      <FiPlus size={18} />
      <span>{label}</span>
    </Link>
  );
}
