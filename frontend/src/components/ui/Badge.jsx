import { cn } from "../../lib/cn";

const toneClasses = {
  neutral: "bg-[var(--color-surface-active)] text-[var(--color-sidebar-active-text,var(--color-brand))] ring-1 ring-[var(--color-border)]",
  brand: "bg-[var(--color-primary-soft)] text-[var(--color-primary)] ring-1 ring-[color:var(--color-primary-soft)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-1 ring-[color:var(--color-success-bg)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-1 ring-[color:var(--color-warning-bg)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-1 ring-[color:var(--color-danger-bg)]",
  info: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-1 ring-[color:var(--color-info-bg)]",
};

export function Badge({ children, className, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
