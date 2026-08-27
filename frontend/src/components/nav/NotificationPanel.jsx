import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function NotificationPanel() {
  const { t } = useTranslation();
  const [state, setState] = useState({
    items: [],
    unreadCount: 0,
    loading: true,
    error: "",
  });

  async function loadNotifications() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await api.get("/notifications", { params: { limit: 5 } });
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
        error: error.response?.data?.message || t("notifications.loadError"),
      }));
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <Card className="min-w-[340px] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{t("common.notifications")}</h3>
        <Badge tone={state.unreadCount ? "warning" : "info"}>
          {state.unreadCount ? t("notifications.unread", { count: state.unreadCount }) : t("notifications.live")}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {state.loading ? <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.loading")}</p> : null}
        {state.error ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}
        {!state.loading && !state.error && !state.items.length ? <p className="text-sm text-[var(--color-foreground-muted)]">{t("notifications.empty")}</p> : null}
        {state.items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-[var(--color-foreground)]">{item.title}</p>
              <Badge tone={item.priority === "critical" ? "danger" : item.priority === "high" ? "warning" : "neutral"}>
                {item.priority}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{item.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <Button onClick={loadNotifications} size="sm" type="button" variant="secondary">{t("common.retry")}</Button>
        <Link to="/notifications">
          <Button size="sm" type="button">{t("common.notifications")}</Button>
        </Link>
      </div>
    </Card>
  );
}
