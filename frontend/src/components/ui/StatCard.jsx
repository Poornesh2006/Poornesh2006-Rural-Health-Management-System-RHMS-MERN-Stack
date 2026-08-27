import { motion } from "framer-motion";
import { Card } from "./Card";

export function StatCard({ label, value, detail, accent, icon: Icon }) {
  return (
    <Card className="overflow-hidden p-0" hover>
      <div className="h-1.5 w-full" style={{ background: accent }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-[var(--color-foreground-muted)]">{label}</p>
          {Icon ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[var(--color-surface-muted)] text-[var(--color-brand)]">
              <Icon size={18} />
            </span>
          ) : null}
        </div>
        <motion.p
          className="ui-stat mt-4 text-4xl font-semibold tracking-tight text-[var(--color-foreground)]"
          initial={{ opacity: 0, y: 6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          {value}
        </motion.p>
        <p className="mt-3 text-sm text-[var(--color-brand)]">{detail}</p>
      </div>
    </Card>
  );
}
