import { cn } from "../../lib/cn";
import { EmptyState } from "./EmptyState";

export function DataTable({ columns, rows, className }) {
  if (!rows.length) {
    return (
      <EmptyState
        action={null}
        description="Try adjusting your search, filters, or date range to reveal matching records."
        title="No records available in this view"
      />
    );
  }

  return (
    <div className={cn("glass-panel overflow-hidden rounded-[2rem] border border-[var(--color-border)] shadow-[var(--shadow-quiet)]", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[var(--color-bg-subtle)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="sticky top-0 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground-muted)]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id || index}
                className="border-t border-[var(--color-border)] transition hover:bg-[var(--color-surface-hover)]"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-sm text-[var(--color-foreground)]">
                    {typeof column.render === "function" ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
