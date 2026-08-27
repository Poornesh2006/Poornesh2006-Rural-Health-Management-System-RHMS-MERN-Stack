import { queueItems, queuePerformance } from "../../data/mockDashboard";
import { Badge } from "../ui/Badge";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { DataTable } from "../ui/DataTable";

export function QueuePanel() {
  const queueColumns = [
    { key: "service", label: "Service" },
    { key: "average", label: "Average Wait" },
    { key: "throughput", label: "Today's Throughput" },
  ];

  return (
    <Card>
      <CardHeader
        action={<Badge tone="success">Queue Active</Badge>}
        description="Priority triage, emergency routing, and throughput monitoring from one surface."
        eyebrow="Live Queue"
        title="Consultation flow and token priority"
      />

      <CardContent className="space-y-4">
        {queueItems.map((item) => (
          <article
            key={item.token}
            className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground-muted)]">
                Token {item.token}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{item.name}</h4>
              <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{item.reason}</p>
            </div>
            <Badge
              tone={
                item.status === "Emergency"
                  ? "danger"
                  : item.status === "Priority"
                    ? "warning"
                    : "neutral"
              }
            >
              {item.status}
            </Badge>
          </article>
        ))}

        <DataTable columns={queueColumns} rows={queuePerformance} />
      </CardContent>
    </Card>
  );
}
