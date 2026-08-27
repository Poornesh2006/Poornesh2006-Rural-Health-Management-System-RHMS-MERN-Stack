export function EmptyState({ title, description, action }) {
  return (
    <div className="mesh-panel rounded-[2rem] border border-dashed border-[var(--color-border)] px-6 py-12 text-center shadow-[var(--shadow-quiet)]">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[image:var(--gradient-brand)] text-lg font-bold text-white shadow-[0_20px_50px_rgba(15,108,189,0.28)]">
          RH
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
