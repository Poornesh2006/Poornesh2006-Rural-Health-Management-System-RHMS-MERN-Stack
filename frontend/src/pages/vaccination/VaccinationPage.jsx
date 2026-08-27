import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Tabs } from "../../components/ui/Tabs";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function VaccineForm({ onCreated }) {
  const [form, setForm] = useState({ vaccineName: "", diseaseProtected: "", manufacturer: "", route: "IM", dosage: "0.5ml" });

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/vaccination/vaccines", form);
    setForm({ vaccineName: "", diseaseProtected: "", manufacturer: "", route: "IM", dosage: "0.5ml" });
    await onCreated();
  }

  return (
    <Card>
      <CardHeader eyebrow="Catalogue" title="Add vaccine" />
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Vaccine name" onChange={(event) => setForm((current) => ({ ...current, vaccineName: event.target.value }))} value={form.vaccineName} />
          <Input label="Disease protected" onChange={(event) => setForm((current) => ({ ...current, diseaseProtected: event.target.value }))} value={form.diseaseProtected} />
          <Input label="Manufacturer" onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value }))} value={form.manufacturer} />
          <Input label="Route" onChange={(event) => setForm((current) => ({ ...current, route: event.target.value }))} value={form.route} />
          <div className="md:col-span-2">
            <Button size="lg" type="submit">Create vaccine</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function VaccinationWorkspace({ vaccines, schedules, onUpdated }) {
  const [history, setHistory] = useState([]);
  const [due, setDue] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    vaccineId: "",
    batchId: "",
    doseNumber: 1,
    route: "IM",
    site: "Left Arm",
    scheduleId: "",
  });

  useEffect(() => {
    if (!form.patientId) {
      setHistory([]);
      setDue([]);
      return;
    }
    async function loadPatientVaccinationData() {
      const [historyResponse, dueResponse] = await Promise.all([
        api.get(`/vaccination/patients/${form.patientId}`),
        api.get(`/vaccination/patients/${form.patientId}/due`),
      ]);
      setHistory(historyResponse.data.data.history);
      setDue(dueResponse.data.data);
    }
    loadPatientVaccinationData();
  }, [form.patientId]);

  useEffect(() => {
    async function loadVaccineBatches() {
      if (!form.vaccineId) {
        setBatches([]);
        return;
      }
      const batchesResponse = await api.get("/vaccination/batches", { params: { vaccineId: form.vaccineId } });
      setBatches(batchesResponse.data.data);
    }
    loadVaccineBatches();
  }, [form.vaccineId]);

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader eyebrow="Patient Search" title="Search vaccination profile" />
        <CardContent className="space-y-4">
          <Input label="Patient ID" onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} value={form.patientId} />
          <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
            <h4 className="font-semibold text-[var(--color-foreground)]">Due vaccines</h4>
            <div className="mt-3 space-y-2">
              {due.map((item) => (
                <div key={`${item.scheduleId}-${item.doseNumber}`} className="rounded-2xl border border-[var(--color-border)] p-3">
                  <p className="font-medium text-[var(--color-foreground)]">{item.vaccineName} dose {item.doseNumber}</p>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">Due: {new Date(item.dueDate).toLocaleDateString("en-IN")}</p>
                  <Badge tone={item.overdue ? "danger" : "warning"}>{item.overdue ? "overdue" : "due"}</Badge>
                </div>
              ))}
              {due.length === 0 ? <p className="text-sm text-[var(--color-foreground-muted)]">No due vaccines found for this patient.</p> : null}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
            <h4 className="font-semibold text-[var(--color-foreground)]">Recent history</h4>
            <div className="mt-3 space-y-2">
              {history.map((record) => (
                <div key={record._id} className="rounded-2xl border border-[var(--color-border)] p-3">
                  <p className="font-medium text-[var(--color-foreground)]">{record.vaccineRef?.vaccineName} dose {record.doseNumber}</p>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{new Date(record.administeredDate).toLocaleDateString("en-IN")} • {record.certificateNumber}</p>
                </div>
              ))}
              {history.length === 0 ? <p className="text-sm text-[var(--color-foreground-muted)]">No vaccination history loaded yet.</p> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Administration" title="Record vaccination" />
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              await api.post("/vaccination/administer", form);
              setForm({ patientId: "", vaccineId: "", batchId: "", doseNumber: 1, route: "IM", site: "Left Arm", scheduleId: "" });
              setHistory([]);
              setDue([]);
              await onUpdated();
            }}
          >
            <Input label="Patient ID" onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} value={form.patientId} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Vaccine</span>
              <select
                className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, vaccineId: event.target.value }))}
                value={form.vaccineId}
              >
                <option value="">Select vaccine</option>
                {vaccines.map((vaccine) => (
                  <option key={vaccine._id} value={vaccine._id}>{vaccine.vaccineName}</option>
                ))}
              </select>
            </label>
            <Input label="Dose number" onChange={(event) => setForm((current) => ({ ...current, doseNumber: Number(event.target.value) }))} type="number" value={form.doseNumber} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Schedule</span>
              <select
                className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, scheduleId: event.target.value }))}
                value={form.scheduleId}
              >
                <option value="">Select schedule</option>
                {schedules.filter((schedule) => !form.vaccineId || schedule.vaccineRef === form.vaccineId || schedule.vaccineRef?._id === form.vaccineId).map((schedule) => (
                  <option key={schedule._id} value={schedule._id}>{schedule.scheduleName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Batch</span>
              <select
                className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, batchId: event.target.value }))}
                value={form.batchId}
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>{batch.batchNumber} • {batch.risk}</option>
                ))}
              </select>
            </label>
            <Input label="Route" onChange={(event) => setForm((current) => ({ ...current, route: event.target.value }))} value={form.route} />
            <Input label="Site" onChange={(event) => setForm((current) => ({ ...current, site: event.target.value }))} value={form.site} />
            <div className="md:col-span-2">
              <Button size="lg" type="submit">Record vaccination</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export function VaccinationPage() {
  const location = useLocation();
  const [tab, setTab] = useState("dashboard");
  const [vaccines, setVaccines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [alerts, setAlerts] = useState([]);

  async function loadAll() {
    const [vaccinesResponse, schedulesResponse, coverageResponse, alertsResponse] = await Promise.all([
      api.get("/vaccination/vaccines"),
      api.get("/vaccination/schedules"),
      api.get("/vaccination/coverage"),
      api.get("/vaccination/alerts"),
    ]);
    setVaccines(vaccinesResponse.data.data);
    setSchedules(schedulesResponse.data.data);
    setCoverage(coverageResponse.data.data);
    setAlerts(alertsResponse.data.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const statCards = coverage
    ? [
        { label: "Administrations", value: String(coverage.totalAdministrations), detail: "All recorded doses", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
        { label: "Today", value: String(coverage.administeredToday), detail: "Recorded today", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
        { label: "Villages", value: String(Object.keys(coverage.byVillage || {}).length), detail: "Coverage areas", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
        { label: "Alerts", value: String(alerts.length), detail: "Batch attention", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Vaccine catalogue, due tracking, administration, and certificate-ready records are now connected to the live vaccination workflow."
        eyebrow="Vaccination"
        title="Vaccination operations"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <Tabs
        items={[
          { label: "Dashboard", value: "dashboard" },
          { label: "Administer", value: "administer" },
          { label: "Alerts", value: "alerts" },
        ]}
        onChange={setTab}
        value={tab}
      />

      {tab === "dashboard" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <VaccineForm onCreated={loadAll} />
          <Card>
            <CardHeader eyebrow="Coverage" title="Village-wise vaccine coverage" />
            <CardContent>
              <DataTable
                columns={[
                  { key: "village", label: "Village" },
                  { key: "count", label: "Administrations" },
                ]}
                rows={Object.entries(coverage?.byVillage || {}).map(([village, count]) => ({ village, count }))}
              />
            </CardContent>
          </Card>
        </section>
      ) : null}

      {tab === "administer" ? <VaccinationWorkspace onUpdated={loadAll} schedules={schedules} vaccines={vaccines} /> : null}

      {tab === "alerts" ? (
        <Card>
          <CardHeader eyebrow="Stock Alerts" title="Vaccine batch attention list" />
          <CardContent>
            <DataTable
              columns={[
                { key: "batchNumber", label: "Batch" },
                { key: "risk", label: "Risk", render: (value) => <Badge tone={value === "expired" ? "danger" : "warning"}>{value}</Badge> },
                { key: "availableQuantity", label: "Available" },
                { key: "expiryDate", label: "Expiry", render: (value) => new Date(value).toLocaleDateString("en-IN") },
              ]}
              rows={alerts}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
