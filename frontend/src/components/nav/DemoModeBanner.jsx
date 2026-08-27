export function DemoModeBanner() {
  const isDemoMode =
    import.meta.env.VITE_DEMO_MODE === "true"
    || import.meta.env.DEV
    || window.localStorage.getItem("rhms-demo-mode") === "true";

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="border-b border-amber-300/30 bg-[linear-gradient(90deg,rgba(217,119,6,0.18),rgba(217,119,6,0.08))] px-6 py-3 text-sm text-[var(--color-foreground)]">
      <span className="font-semibold tracking-[0.12em] text-amber-700 dark:text-amber-300">DEMO MODE</span>
      <span className="ml-3 text-[var(--color-foreground-muted)]">
        Synthetic data only. This environment is prepared for college presentation, viva, and guided demonstration.
      </span>
    </div>
  );
}
