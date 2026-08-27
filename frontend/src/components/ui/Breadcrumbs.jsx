import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-foreground-muted)]">
        {items.map((item, index) => (
          <li key={item.to} className="flex items-center gap-2">
            {index > 0 ? <FiChevronRight size={14} /> : null}
            {index === items.length - 1 ? (
              <span className="font-semibold text-[var(--color-foreground)]">{item.label}</span>
            ) : (
              <Link className="transition hover:text-[var(--color-brand)]" to={item.to}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
