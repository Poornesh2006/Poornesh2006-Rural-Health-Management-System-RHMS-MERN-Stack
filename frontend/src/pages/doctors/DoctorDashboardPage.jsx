import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function DoctorDashboardPage() {
  const location = useLocation();
  const { user } = useAuth();
  const doctorId = user?.sub || user?._id;
  const [queue, setQueue] = useState([]);
  const [consultationForm, setConsultationForm] = useState({
    queueEntryId: "",
    complaint: "",
    symptoms: "",
    diagnosis: "",
    notes: "",
  });

  async function loadQueue() {
    try {
      const response = await api.get("/queue", {
        params: user?.role === "doctor" ? { doctorId } : {},
      });
      setQueue(response.data.data);
    } catch {
      setQueue([]);
    }
  }

  useEffect(() => {
    loadQueue();
    const socket = getSocket();
    if (doctorId) {
      socket.emit("subscribe:doctor", doctorId);
    }
    socket.on("queue:updated", loadQueue);
    socket.on("queue:started", loadQueue);
    socket.on("queue:completed", loadQueue);
    return () => {
      socket.off("queue:updated", loadQueue);
      socket.off("queue:started", loadQueue);
      socket.off("queue:completed", loadQueue);
    };
  }, [doctorId, user?.role]);

  const stats = useMemo(() => {
    const waiting = queue.filter((item) => item.status === "waiting").length;
    const called = queue.filter((item) => item.status === "called").length;
    const active = queue.filter((item) => item.status === "in_consultation").length;
    const completed = queue.filter((item) => item.status === "completed").length;

    return [
      { label: "Waiting", value: String(waiting), detail: "Ready for call", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
      { label: "Called", value: String(called), detail: "Move to consultation", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
      { label: "In Consultation", value: String(active), detail: "Current care sessions", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
      { label: "Completed", value: String(completed), detail: "Closed today", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
    ];
  }, [queue]);

  const currentPatient = queue.find((item) => item.status === "in_consultation") || queue.find((item) => item.status === "called");

  async function submitConsultation(event) {
    event.preventDefault();

    await api.post("/consultations/complete", {
      queueEntryId: consultationForm.queueEntryId,
      complaint: consultationForm.complaint,
      symptoms: consultationForm.symptoms.split(",").map((item) => item.trim()).filter(Boolean),
      diagnosis: consultationForm.diagnosis,
      notes: consultationForm.notes,
      prescription: [],
      labRequests: [],
    });

    setConsultationForm({ queueEntryId: "", complaint: "", symptoms: "", diagnosis: "", notes: "" });
    loadQueue();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Doctor-facing queue, consultation start, and consultation completion are now integrated with the live workflow APIs."
        eyebrow="Doctor Workflow"
        title="Doctor dashboard"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader eyebrow="Current Patient" title={currentPatient ? currentPatient.patientName : "No active patient"} />
          <CardContent className="space-y-3">
            {currentPatient ? (
              <>
                <p className="text-sm text-[var(--color-foreground-muted)]">{currentPatient.displayToken} • {currentPatient.department}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await api.post(`/queue/${currentPatient._id}/status`, { status: "called" });
                      await loadQueue();
                    }}
                    size="sm"
                    type="button"
                  >
                    Call
                  </Button>
                  <Button
                    onClick={async () => {
                      await api.post("/consultations/start", { queueEntryId: currentPatient._id });
                      setConsultationForm((current) => ({ ...current, queueEntryId: currentPatient._id }));
                      await loadQueue();
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Start consultation
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--color-foreground-muted)]">No patient is currently assigned to the doctor workflow.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Consultation Workspace" title="Complete consultation" />
          <CardContent>
            <form className="space-y-4" onSubmit={submitConsultation}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Queue entry</span>
                <select
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setConsultationForm((current) => ({ ...current, queueEntryId: event.target.value }))}
                  value={consultationForm.queueEntryId}
                >
                  <option value="">Select queue entry</option>
                  {queue.filter((item) => ["called", "in_consultation"].includes(item.status)).map((item) => (
                    <option key={item._id} value={item._id}>{item.displayToken} - {item.patientName}</option>
                  ))}
                </select>
              </label>
              <Input label="Complaint" onChange={(event) => setConsultationForm((current) => ({ ...current, complaint: event.target.value }))} value={consultationForm.complaint} />
              <Input hint="Comma separated" label="Symptoms" onChange={(event) => setConsultationForm((current) => ({ ...current, symptoms: event.target.value }))} value={consultationForm.symptoms} />
              <Input label="Diagnosis" onChange={(event) => setConsultationForm((current) => ({ ...current, diagnosis: event.target.value }))} value={consultationForm.diagnosis} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Clinical notes</span>
                <textarea
                  className="min-h-28 w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setConsultationForm((current) => ({ ...current, notes: event.target.value }))}
                  value={consultationForm.notes}
                />
              </label>
              <Button size="lg" type="submit">Complete consultation</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
