import { Button } from "./Button";
import { cn } from "../../lib/cn";

export function Tabs({ items, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2">
      {items.map((item) => (
        <Button
          key={item.value}
          className={cn(
            "h-10 rounded-xl px-4",
            value === item.value ? "bg-[var(--color-brand)] text-white" : "",
          )}
          onClick={() => onChange(item.value)}
          size="sm"
          type="button"
          variant={value === item.value ? "primary" : "ghost"}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
