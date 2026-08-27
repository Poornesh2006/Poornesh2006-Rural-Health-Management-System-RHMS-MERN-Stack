import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function NotificationsSummary({ items = [] }) {
  return (
    <Card>
      <CardHeader
        action={
          <Link to="/notifications">
            <Button size="sm" type="button" variant="secondary">
              Open center
            </Button>
          </Link>
        }
        eyebrow="Notifications"
        title="Operational alerts and follow-up reminders"
      />
      <CardContent className="space-y-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-[var(--color-foreground)]">{item.title}</h4>
              <Badge tone={item.tone}>{item.tone}</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{item.description}</p>
          </div>
        )) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">No recent alerts available.</p>
        )}
      </CardContent>
    </Card>
  );
}
