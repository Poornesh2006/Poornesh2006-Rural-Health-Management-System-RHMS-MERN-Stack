import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef(function Input(
  { className, label, hint, error, icon: Icon, ...props },
  ref,
) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">{label}</span> : null}
      <div
        className={cn(
          "glass-panel flex items-center gap-3 rounded-[1.3rem] border border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-quiet)] transition focus-within:border-[var(--color-brand)] focus-within:shadow-[0_0_0_4px_rgba(76,201,240,0.12)]",
          error && "border-[var(--color-danger)] focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]",
        )}
      >
        {Icon ? <Icon className="shrink-0 text-[var(--color-foreground-muted)]" size={18} /> : null}
        <input
          ref={ref}
          className={cn(
            "w-full border-none bg-transparent text-sm text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)]",
            className,
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{hint}</p> : null}
    </label>
  );
});
