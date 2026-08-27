import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function NotificationsPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ category: "", priority: "" });
  const [state, setState] = useState({ items: [], unreadCount: 0, loading: true, error: "" });

  async function loadNotifications() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await api.get("/notifications", { params: filters });
      setState({
        items: response.data.data.items,
        unreadCount: response.data.data.unreadCount,
        loading: false,
        error: "",
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error.response?.data?.message || "Unable to load notifications",
      }));
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [filters.category, filters.priority]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/notifications")}
        description="In-app delivery status, filters, and read-state controls are now connected to the centralized notification API."
        eyebrow={t("notifications")}
        title={t("notifications")}
      />

      <Card>
        <CardHeader
          description="Filter by category and priority, then review delivery-safe operational messages."
          eyebrow="Inbox"
          title={`Unread: ${state.unreadCount}`}
        />
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <select className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} value={filters.category}>
              <option value="">All categories</option>
              <option value="appointment">Appointment</option>
              <option value="queue">Queue</option>
              <option value="laboratory">Laboratory</option>
              <option value="vaccination">Vaccination</option>
              <option value="security">Security</option>
            </select>
            <select className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} value={filters.priority}>
              <option value="">All priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <Button onClick={async () => { await api.post("/notifications/read-all"); await loadNotifications(); }} size="md" type="button" variant="secondary">
              {t("markAllRead")}
            </Button>
          </div>

          {state.loading ? <p className="text-sm text-[var(--color-foreground-muted)]">Loading...</p> : null}
          {state.error ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}

          <div className="space-y-3">
            {state.items.map((item) => (
              <div key={item._id} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{item.message}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={item.priority === "critical" ? "danger" : item.priority === "high" ? "warning" : "info"}>{item.priority}</Badge>
                    <Badge tone={item.readAt ? "success" : "warning"}>{item.readAt ? "read" : "unread"}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!item.readAt ? (
                    <Button onClick={async () => { await api.patch(`/notifications/${item._id}/read`); await loadNotifications(); }} size="sm" type="button">
                      Mark read
                    </Button>
                  ) : null}
                  {item.actionUrl ? (
                    <a className="inline-flex items-center rounded-2xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]" href={item.actionUrl}>
                      Open
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
            {!state.loading && !state.items.length ? <p className="text-sm text-[var(--color-foreground-muted)]">{t("notificationEmpty")}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
