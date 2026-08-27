import { FiActivity, FiAlertCircle, FiClock, FiShield } from "react-icons/fi";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";

const highlights = [
  {
    icon: FiAlertCircle,
    title: "High-risk cohort",
    detail: "12 antenatal and diabetic patients require same-day review.",
    tone: "warning",
  },
  {
    icon: FiClock,
    title: "Follow-up adherence",
    detail: "84% of scheduled follow-ups completed in the past 30 days.",
    tone: "info",
  },
  {
    icon: FiShield,
    title: "Clinical readiness",
    detail: "All triage counters active, emergency desk staffed, no queue escalation.",
    tone: "success",
  },
  {
    icon: FiActivity,
    title: "Village surveillance",
    detail: "Melaur shows a mild spike in seasonal respiratory complaints this week.",
    tone: "brand",
  },
];

export function CareHighlights() {
  return (
    <Card>
      <CardHeader
        description="A design-system backed module for risk, operational, and public-health summaries."
        eyebrow="Clinical Signals"
        title="What needs attention right now"
      />
      <CardContent className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-2xl bg-[var(--color-surface-strong)] p-3 shadow-[var(--shadow-quiet)]">
                  <Icon className="text-[var(--color-brand)]" size={18} />
                </span>
                <Badge tone={item.tone}>{item.tone}</Badge>
              </div>
              <h4 className="mt-4 text-lg font-semibold text-[var(--color-foreground)]">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--color-foreground-muted)]">{item.detail}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
