import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { createPublicDisplaySocket } from "../../services/socket";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function QueueColumn({ title, items }) {
  return (
    <Card>
      <CardHeader eyebrow="Waiting Hall" title={title} />
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--color-foreground-muted)]">
                    {item.department}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{item.displayToken}</p>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                    Room: {item.consultationRoom || item.department}
                  </p>
                </div>
                <Badge tone={item.status === "called" ? "info" : item.status === "in_consultation" ? "warning" : "neutral"}>
                  {item.status.replaceAll("_", " ")}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">No tokens to display right now.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function WaitingQueuePage({ publicMode = false }) {
  const location = useLocation();
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    async function loadQueue() {
      try {
        const response = await api.get("/queue/public");
        setQueue(response.data.data);
      } catch {
        setQueue([]);
      }
    }

    loadQueue();

    const socket = createPublicDisplaySocket();
    socket.emit("subscribe:department", "General OP");
    socket.on("queue:updated", loadQueue);
    socket.on("queue:token-created", loadQueue);
    socket.on("queue:called", loadQueue);
    socket.on("queue:completed", loadQueue);

    return () => {
      socket.off("queue:updated", loadQueue);
      socket.off("queue:token-created", loadQueue);
      socket.off("queue:called", loadQueue);
      socket.off("queue:completed", loadQueue);
      socket.close();
    };
  }, []);

  const grouped = useMemo(
    () => ({
      current: queue.filter((item) => item.status === "in_consultation"),
      called: queue.filter((item) => item.status === "called"),
      waiting: queue.filter((item) => item.status === "waiting"),
      completed: queue.filter((item) => item.status === "completed").slice(-6).reverse(),
    }),
    [queue],
  );

  const wrapperClassName = publicMode
    ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(107,211,136,0.18),_transparent_35%),linear-gradient(135deg,#08120d,#102118_52%,#173020)] px-6 py-8 text-white"
    : "space-y-6";

  return (
    <div className={wrapperClassName}>
      {publicMode ? (
        <section className="mx-auto mb-8 max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/80">Rural Health Management System</p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">Live Token Display</h1>
              <p className="mt-2 text-base text-emerald-50/80">
                Please wait for your token to be called and proceed to the assigned consultation room.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/10 px-4 py-3 text-sm text-emerald-50/80">
              Auto-refresh enabled through live queue updates
            </div>
          </div>
        </section>
      ) : (
        <PageHeader
          breadcrumbs={getBreadcrumbs(location.pathname)}
          description="Privacy-safe waiting hall display backed by the live queue feed."
          eyebrow="Public Display"
          title="Waiting hall display"
        />
      )}

      <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-2">
        <QueueColumn items={grouped.current} title="Currently Consulting" />
        <QueueColumn items={grouped.called} title="Called Next" />
        <QueueColumn items={grouped.waiting} title="Waiting" />
        <QueueColumn items={grouped.completed} title="Recently Completed" />
      </section>
    </div>
  );
}
