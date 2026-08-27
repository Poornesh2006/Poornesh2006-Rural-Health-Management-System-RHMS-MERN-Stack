import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { getSocket } from "../../services/socket";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { offlineDb } from "../../services/offline-db";
import { getBreadcrumbs } from "../../utils/breadcrumbs";
import { useLocation } from "react-router-dom";

function QueueSection({ title, items, actions = [] }) {
  return (
    <Card>
      <CardHeader eyebrow="Live Queue" title={title} />
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item._id} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-foreground-muted)]">{item.displayToken}</p>
                  <h4 className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">{item.patientName}</h4>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{item.department} • {item.doctorName || "Doctor pending"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={item.priority === "emergency" ? "danger" : item.priority === "normal" ? "neutral" : "warning"}>{item.priority}</Badge>
                  <Badge tone="info">{item.status}</Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Button key={action.label} onClick={() => action.onClick(item)} size="sm" type="button" variant={action.variant || "secondary"}>
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">No tokens in this section.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function QueuePage() {
  const location = useLocation();
  const [queue, setQueue] = useState([]);

  async function loadQueue() {
    try {
      const response = await api.get("/queue");
      setQueue(response.data.data);
      await offlineDb.set("cachedQueue", "live-queue", response.data.data);
    } catch {
      setQueue((await offlineDb.get("cachedQueue", "live-queue")) || []);
    }
  }

  useEffect(() => {
    loadQueue();
    const socket = getSocket();
    socket.emit("subscribe:role", "receptionist");
    socket.on("queue:updated", loadQueue);
    socket.on("queue:token-created", loadQueue);
    return () => {
      socket.off("queue:updated", loadQueue);
      socket.off("queue:token-created", loadQueue);
    };
  }, []);

  const grouped = {
    waiting: queue.filter((item) => item.status === "waiting"),
    called: queue.filter((item) => item.status === "called"),
    inConsultation: queue.filter((item) => item.status === "in_consultation"),
    skipped: queue.filter((item) => item.status === "skipped"),
    completed: queue.filter((item) => item.status === "completed"),
  };

  const receptionActions = [
    {
      label: "Call",
      onClick: async (item) => {
        await api.post(`/queue/${item._id}/status`, { status: "called" });
        loadQueue();
      },
    },
    {
      label: "Skip",
      onClick: async (item) => {
        await api.post(`/queue/${item._id}/status`, { status: "skipped" });
        loadQueue();
      },
      variant: "ghost",
    },
    {
      label: "Emergency",
      onClick: async (item) => {
        await api.post(`/queue/${item._id}/priority`, { priority: "emergency", emergencyReason: "Manual escalation" });
        loadQueue();
      },
      variant: "ghost",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Reception queue is now live with state transitions, priority changes, and real-time refresh."
        eyebrow="Token Queue"
        title="Live waiting queue"
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <QueueSection actions={receptionActions} items={grouped.waiting} title="Waiting" />
        <QueueSection
          actions={[
            {
              label: "Start consultation",
              onClick: async (item) => {
                await api.post("/consultations/start", { queueEntryId: item._id });
                loadQueue();
              },
            },
          ]}
          items={grouped.called}
          title="Called"
        />
        <QueueSection items={grouped.inConsultation} title="Currently Consulting" />
        <QueueSection
          actions={[
            {
              label: "Recall",
              onClick: async (item) => {
                await api.post(`/queue/${item._id}/status`, { status: "called" });
                loadQueue();
              },
            },
          ]}
          items={grouped.skipped}
          title="Skipped"
        />
        <QueueSection items={grouped.completed} title="Completed" />
      </div>
    </div>
  );
}
