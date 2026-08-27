import { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiArrowUpRight, FiCheckCircle, FiSearch } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function toneForSeverity(value) {
  if (value === "critical" || value === "high") {
    return "danger";
  }
  if (value === "medium") {
    return "warning";
  }
  if (value === "resolved" || value === "completed" || value === "valid") {
    return "success";
  }
  return "info";
}

function toneForStatus(value) {
  if (value === "resolved" || value === "completed" || value === "valid") {
    return "success";
  }
  if (value === "acknowledged" || value === "in_progress") {
    return "warning";
  }
  if (value === "missed" || value === "invalid" || value === "revoked") {
    return "danger";
  }
  return "info";
}

function formatDate(value) {
  if (!value) {
    return "Pending";
  }
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseMembers(text) {
  return text
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [patientId, relationship = "other"] = entry.split(":").map((part) => part.trim());
      return { patientId, name: patientId, relationship: relationship || "other" };
    });
}

function OperationsPageScaffold({ title, eyebrow, description, actions, children }) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        actions={actions}
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      {children}
    </div>
  );
}

export function CommandCenterPage() {
  const [summary, setSummary] = useState({ operations: {} });
  const [alerts, setAlerts] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [summaryResponse, alertsResponse, followUpsResponse, handoversResponse, qualityResponse] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/operations/alerts"),
          api.get("/operations/follow-up-tasks"),
          api.get("/operations/shift-handovers"),
          api.get("/operations/data-quality"),
        ]);
        setSummary(summaryResponse.data.data);
        setAlerts(alertsResponse.data.data);
        setFollowUps(followUpsResponse.data.data);
        setHandovers(handoversResponse.data.data);
        setDataQuality(qualityResponse.data.data);
      } catch {
        setSummary({ operations: {} });
        setAlerts([]);
        setFollowUps([]);
        setHandovers([]);
        setDataQuality([]);
      }
    }

    load();
  }, []);

  const overviewCards = useMemo(
    () => [
      { label: "Open alerts", value: String(alerts.filter((item) => item.status !== "resolved").length), detail: "Operational risks and escalations", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
      { label: "Follow-ups", value: String(followUps.filter((item) => item.status !== "completed").length), detail: "Community care tasks still active", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
      { label: "Handovers", value: String(handovers.filter((item) => item.status !== "resolved").length), detail: "Shift continuity items in progress", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
      { label: "Data quality", value: String(dataQuality.length), detail: "Records needing cleanup", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
    ],
    [alerts, dataQuality.length, followUps, handovers],
  );

  return (
    <OperationsPageScaffold
      actions={
        <div className="flex flex-wrap gap-3">
          <Link to="/operations/alerts"><Button size="md" type="button" variant="secondary">Open alerts</Button></Link>
          <Link to="/operations/follow-ups"><Button size="md" type="button">Review follow-ups</Button></Link>
        </div>
      }
      description="A live PHC operations layer for alerts, shift continuity, outreach follow-ups, and record quality."
      eyebrow="Today At PHC"
      title="Operations command center"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader eyebrow="Immediate Attention" title="Top operational alerts" />
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4" key={alert.alertNumber}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{alert.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{alert.description || "No additional detail provided."}</p>
                  </div>
                  <Badge tone={toneForSeverity(alert.severity)}>{alert.severity}</Badge>
                </div>
              </div>
            ))}
            {!alerts.length ? <EmptyState description="Alerts will appear here as stock, lab, follow-up, and sync workflows surface issues." title="No active alerts" /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Live Snapshot" title="Facility activity summary" />
          <CardContent className="grid gap-3">
            <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Today's visits</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{summary.operations?.todaysVisits ?? 0}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Critical labs</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{summary.operations?.criticalLabResults ?? 0}</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Low medicine stock</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{summary.operations?.lowMedicineBatches ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Follow-up Board" title="Tasks due now" />
          <CardContent>
            <DataTable
              columns={[
                { key: "patientName", label: "Patient" },
                { key: "category", label: "Category" },
                { key: "dueDate", label: "Due", render: (value) => formatDate(value) },
                { key: "status", label: "Status", render: (value) => <Badge tone={toneForStatus(value)}>{value}</Badge> },
              ]}
              rows={followUps.slice(0, 6)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Data Quality" title="Records that need review" />
          <CardContent>
            <DataTable
              columns={[
                { key: "module", label: "Module" },
                { key: "record", label: "Record" },
                { key: "problem", label: "Problem" },
                { key: "severity", label: "Severity", render: (value) => <Badge tone={toneForSeverity(value)}>{value}</Badge> },
              ]}
              rows={dataQuality.slice(0, 8).map((item, index) => ({ id: `${item.record}-${index}`, ...item }))}
            />
          </CardContent>
        </Card>
      </section>
    </OperationsPageScaffold>
  );
}

export function HouseholdsPage() {
  const [households, setHouseholds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState({
    familyName: "",
    village: "",
    address: "",
    headOfHousehold: "",
    contactNumber: "",
    assignedHealthWorkerName: "",
    notes: "",
    members: "",
  });

  async function loadHouseholds() {
    try {
      const response = await api.get("/operations/households");
      setHouseholds(response.data.data);
    } catch {
      setHouseholds([]);
    }
  }

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      await api.post("/operations/households", {
        ...formState,
        members: parseMembers(formState.members),
      });
      setFormState({
        familyName: "",
        village: "",
        address: "",
        headOfHousehold: "",
        contactNumber: "",
        assignedHealthWorkerName: "",
        notes: "",
        members: "",
      });
      await loadHouseholds();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to create household");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationsPageScaffold description="Group family members into a shared community-health view for outreach, follow-up, and household risk monitoring." eyebrow="Households" title="Household health registry">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader eyebrow="Create Household" title="Register family cluster" />
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Family name" onChange={(event) => setFormState((current) => ({ ...current, familyName: event.target.value }))} value={formState.familyName} />
              <Input label="Village" onChange={(event) => setFormState((current) => ({ ...current, village: event.target.value }))} value={formState.village} />
              <Input label="Address" onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))} value={formState.address} />
              <Input label="Head of household" onChange={(event) => setFormState((current) => ({ ...current, headOfHousehold: event.target.value }))} value={formState.headOfHousehold} />
              <Input label="Contact number" onChange={(event) => setFormState((current) => ({ ...current, contactNumber: event.target.value }))} value={formState.contactNumber} />
              <Input label="Assigned worker" onChange={(event) => setFormState((current) => ({ ...current, assignedHealthWorkerName: event.target.value }))} value={formState.assignedHealthWorkerName} />
              <Input hint="Use patientId:relationship, separated by commas. Example: PAT-001:father, PAT-002:daughter" label="Members" onChange={(event) => setFormState((current) => ({ ...current, members: event.target.value }))} value={formState.members} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Notes</span>
                <textarea className="min-h-28 w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))} value={formState.notes} />
              </label>
              {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}
              <Button size="lg" type="submit">{saving ? "Saving..." : "Create household"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Registry" title="Existing households" />
          <CardContent>
            <DataTable
              columns={[
                { key: "householdId", label: "ID" },
                { key: "familyName", label: "Family" },
                { key: "village", label: "Village" },
                { key: "headOfHousehold", label: "Head" },
                { key: "memberCount", label: "Members" },
              ]}
              rows={households.map((item) => ({ ...item, memberCount: item.members?.length ?? 0 }))}
            />
          </CardContent>
        </Card>
      </section>
    </OperationsPageScaffold>
  );
}

export function FollowUpBoardPage() {
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    patientId: "",
    patientName: "",
    village: "",
    category: "due_today",
    reason: "",
    dueDate: "",
    assignedToName: "",
    assignedRole: "",
    notes: "",
  });

  async function loadTasks() {
    try {
      const response = await api.get("/operations/follow-up-tasks");
      setTasks(response.data.data);
    } catch {
      setTasks([]);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function createTask(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/operations/follow-up-tasks", formState);
      setFormState({
        patientId: "",
        patientName: "",
        village: "",
        category: "due_today",
        reason: "",
        dueDate: "",
        assignedToName: "",
        assignedRole: "",
        notes: "",
      });
      await loadTasks();
    } finally {
      setSaving(false);
    }
  }

  async function updateTaskStatus(taskNumber, status) {
    await api.patch(`/operations/follow-up-tasks/${taskNumber}`, { status });
    await loadTasks();
  }

  return (
    <OperationsPageScaffold description="Track missed visits, vaccination due cases, lab callbacks, and medication follow-up work across staff roles." eyebrow="Follow-Up Board" title="Patient follow-up coordination">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader eyebrow="New Task" title="Create follow-up item" />
          <CardContent>
            <form className="space-y-4" onSubmit={createTask}>
              <Input label="Patient ID" onChange={(event) => setFormState((current) => ({ ...current, patientId: event.target.value }))} value={formState.patientId} />
              <Input label="Patient name" onChange={(event) => setFormState((current) => ({ ...current, patientName: event.target.value }))} value={formState.patientName} />
              <Input label="Village" onChange={(event) => setFormState((current) => ({ ...current, village: event.target.value }))} value={formState.village} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Category</span>
                <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))} value={formState.category}>
                  <option value="due_today">Due today</option>
                  <option value="due_this_week">Due this week</option>
                  <option value="overdue">Overdue</option>
                  <option value="missed_once">Missed once</option>
                  <option value="missed_multiple_times">Missed multiple times</option>
                  <option value="lab_review_pending">Lab review pending</option>
                  <option value="vaccination_due">Vaccination due</option>
                  <option value="prescription_follow_up">Prescription follow-up</option>
                  <option value="referral_follow_up">Referral follow-up</option>
                </select>
              </label>
              <Input label="Reason" onChange={(event) => setFormState((current) => ({ ...current, reason: event.target.value }))} value={formState.reason} />
              <Input label="Due date" onChange={(event) => setFormState((current) => ({ ...current, dueDate: event.target.value }))} type="date" value={formState.dueDate} />
              <Input label="Assigned to" onChange={(event) => setFormState((current) => ({ ...current, assignedToName: event.target.value }))} value={formState.assignedToName} />
              <Input label="Assigned role" onChange={(event) => setFormState((current) => ({ ...current, assignedRole: event.target.value }))} value={formState.assignedRole} />
              <Input label="Notes" onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))} value={formState.notes} />
              <Button size="lg" type="submit">{saving ? "Saving..." : "Create task"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Task Queue" title="Open and recent follow-ups" />
          <CardContent className="space-y-4">
            {tasks.length ? tasks.map((task) => (
              <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4" key={task.taskNumber}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{task.patientName || task.patientId || "Unlinked patient"}</p>
                    <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{task.reason}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-foreground-muted)]">{task.village || "Village pending"} | Due {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={toneForStatus(task.status)}>{task.status}</Badge>
                    <Badge tone="neutral">{task.category.replaceAll("_", " ")}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => updateTaskStatus(task.taskNumber, "in_progress")} size="sm" type="button" variant="secondary">Start</Button>
                  <Button onClick={() => updateTaskStatus(task.taskNumber, "completed")} size="sm" type="button" variant="success">Complete</Button>
                  <Button onClick={() => updateTaskStatus(task.taskNumber, "missed")} size="sm" type="button" variant="outline">Mark missed</Button>
                </div>
              </div>
            )) : <EmptyState description="Create the first outreach or clinical follow-up task to start the board." title="No follow-up tasks yet" />}
          </CardContent>
        </Card>
      </section>
    </OperationsPageScaffold>
  );
}

export function ShiftHandoverPage() {
  const [handovers, setHandovers] = useState([]);
  const [formState, setFormState] = useState({
    title: "",
    handoverNote: "",
    priority: "medium",
    assignedPerson: "",
    expectedAction: "",
    dueTime: "",
    incomingStaffName: "",
    module: "operations",
    relatedRecordId: "",
  });

  async function loadHandovers() {
    try {
      const response = await api.get("/operations/shift-handovers");
      setHandovers(response.data.data);
    } catch {
      setHandovers([]);
    }
  }

  useEffect(() => {
    loadHandovers();
  }, []);

  async function submitHandover(event) {
    event.preventDefault();
    await api.post("/operations/shift-handovers", formState);
    setFormState({
      title: "",
      handoverNote: "",
      priority: "medium",
      assignedPerson: "",
      expectedAction: "",
      dueTime: "",
      incomingStaffName: "",
      module: "operations",
      relatedRecordId: "",
    });
    await loadHandovers();
  }

  async function updateStatus(handoverNumber, status) {
    await api.patch(`/operations/shift-handovers/${handoverNumber}`, { status });
    await loadHandovers();
  }

  return (
    <OperationsPageScaffold description="Hand over unresolved work safely between reception, doctors, pharmacy, lab, and administration teams." eyebrow="Shift Continuity" title="Shift handover board">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader eyebrow="Create Handover" title="Pass critical work forward" />
          <CardContent>
            <form className="space-y-4" onSubmit={submitHandover}>
              <Input label="Title" onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} value={formState.title} />
              <Input label="Assigned person" onChange={(event) => setFormState((current) => ({ ...current, assignedPerson: event.target.value }))} value={formState.assignedPerson} />
              <Input label="Incoming staff name" onChange={(event) => setFormState((current) => ({ ...current, incomingStaffName: event.target.value }))} value={formState.incomingStaffName} />
              <Input label="Expected action" onChange={(event) => setFormState((current) => ({ ...current, expectedAction: event.target.value }))} value={formState.expectedAction} />
              <Input label="Module" onChange={(event) => setFormState((current) => ({ ...current, module: event.target.value }))} value={formState.module} />
              <Input label="Related record ID" onChange={(event) => setFormState((current) => ({ ...current, relatedRecordId: event.target.value }))} value={formState.relatedRecordId} />
              <Input label="Due time" onChange={(event) => setFormState((current) => ({ ...current, dueTime: event.target.value }))} type="datetime-local" value={formState.dueTime} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Priority</span>
                <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, priority: event.target.value }))} value={formState.priority}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Handover note</span>
                <textarea className="min-h-28 w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, handoverNote: event.target.value }))} value={formState.handoverNote} />
              </label>
              <Button size="lg" type="submit">Create handover</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Open Handovers" title="Tasks moving between shifts" />
          <CardContent className="space-y-4">
            {handovers.length ? handovers.map((handover) => (
              <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4" key={handover.handoverNumber}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{handover.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{handover.handoverNote || "No note provided."}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-foreground-muted)]">Due {formatDate(handover.dueTime)} | {handover.assignedPerson || "Unassigned"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={toneForSeverity(handover.priority)}>{handover.priority}</Badge>
                    <Badge tone={toneForStatus(handover.status)}>{handover.status}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => updateStatus(handover.handoverNumber, "acknowledged")} size="sm" type="button" variant="secondary">Acknowledge</Button>
                  <Button onClick={() => updateStatus(handover.handoverNumber, "resolved")} size="sm" type="button" variant="success">Resolve</Button>
                </div>
              </div>
            )) : <EmptyState description="Handovers created by one shift will appear here for the incoming team." title="No handovers yet" />}
          </CardContent>
        </Card>
      </section>
    </OperationsPageScaffold>
  );
}

export function AlertCenterPage() {
  const [alerts, setAlerts] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);
  const [formState, setFormState] = useState({
    category: "data_quality",
    severity: "medium",
    title: "",
    description: "",
    sourceModule: "",
    sourceRecordId: "",
    assignedToName: "",
  });

  async function load() {
    try {
      const [alertsResponse, qualityResponse] = await Promise.all([
        api.get("/operations/alerts"),
        api.get("/operations/data-quality"),
      ]);
      setAlerts(alertsResponse.data.data);
      setDataQuality(qualityResponse.data.data);
    } catch {
      setAlerts([]);
      setDataQuality([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createAlert(event) {
    event.preventDefault();
    await api.post("/operations/alerts", formState);
    setFormState({
      category: "data_quality",
      severity: "medium",
      title: "",
      description: "",
      sourceModule: "",
      sourceRecordId: "",
      assignedToName: "",
    });
    await load();
  }

  async function updateAlertStatus(alertNumber, status) {
    await api.patch(`/operations/alerts/${alertNumber}`, { status });
    await load();
  }

  return (
    <OperationsPageScaffold description="View system-generated warnings, hand-created escalations, and data cleanup issues from one alert center." eyebrow="Alert Center" title="Operational alerts and data quality">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader eyebrow="Create Alert" title="Raise an operational issue" />
          <CardContent>
            <form className="space-y-4" onSubmit={createAlert}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Category</span>
                <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))} value={formState.category}>
                  <option value="data_quality">Data quality</option>
                  <option value="lab_critical">Critical lab</option>
                  <option value="low_medicine_stock">Low medicine stock</option>
                  <option value="failed_sync">Failed sync</option>
                  <option value="overdue_follow_up">Overdue follow-up</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Severity</span>
                <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, severity: event.target.value }))} value={formState.severity}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <Input label="Title" onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} value={formState.title} />
              <Input label="Description" onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} value={formState.description} />
              <Input label="Source module" onChange={(event) => setFormState((current) => ({ ...current, sourceModule: event.target.value }))} value={formState.sourceModule} />
              <Input label="Source record" onChange={(event) => setFormState((current) => ({ ...current, sourceRecordId: event.target.value }))} value={formState.sourceRecordId} />
              <Input label="Assigned to" onChange={(event) => setFormState((current) => ({ ...current, assignedToName: event.target.value }))} value={formState.assignedToName} />
              <Button size="lg" type="submit">Create alert</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader eyebrow="Live Alerts" title="Current escalations" />
            <CardContent className="space-y-4">
              {alerts.length ? alerts.map((alert) => (
                <div className="rounded-[1.4rem] border border-[var(--color-border)] p-4" key={alert.alertNumber}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-foreground)]">{alert.title}</p>
                      <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{alert.description || "No detail provided."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={toneForSeverity(alert.severity)}>{alert.severity}</Badge>
                      <Badge tone={toneForStatus(alert.status)}>{alert.status}</Badge>
                    </div>
                  </div>
                  {String(alert.alertNumber).startsWith("DERIVED-") ? null : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={() => updateAlertStatus(alert.alertNumber, "acknowledged")} size="sm" type="button" variant="secondary">Acknowledge</Button>
                      <Button onClick={() => updateAlertStatus(alert.alertNumber, "resolved")} size="sm" type="button" variant="success">Resolve</Button>
                    </div>
                  )}
                </div>
              )) : <EmptyState description="Operational, stock, lab, and sync warnings will appear here automatically." title="No alerts right now" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Data Cleanup" title="Top quality issues" />
            <CardContent>
              <DataTable
                columns={[
                  { key: "module", label: "Module" },
                  { key: "record", label: "Record" },
                  { key: "problem", label: "Problem" },
                  { key: "suggestedAction", label: "Suggested action" },
                ]}
                rows={dataQuality.slice(0, 10).map((item, index) => ({ id: `${item.record}-${index}`, ...item }))}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </OperationsPageScaffold>
  );
}

export function DocumentVerificationPage() {
  const [formState, setFormState] = useState({
    documentType: "patient_health_card",
    documentNumber: "",
    issuingFacility: "",
    issueDate: "",
    patientMaskedIdentifier: "",
    resourceType: "",
    resourceId: "",
  });
  const [result, setResult] = useState(null);
  const [lookupToken, setLookupToken] = useState("");
  const [lookupResult, setLookupResult] = useState(null);

  async function createVerification(event) {
    event.preventDefault();
    const response = await api.post("/operations/document-verifications", formState);
    setResult(response.data.data);
  }

  async function verifyLookup(event) {
    event.preventDefault();
    const response = await api.get(`/operations/verify/${lookupToken}`);
    setLookupResult(response.data.data);
  }

  const publicUrl = result ? `${window.location.origin}/verify/${result.publicToken}` : "";

  return (
    <OperationsPageScaffold description="Generate QR-ready public verification records for cards, reports, certificates, and referrals." eyebrow="Document Verification" title="Verification and QR workflow">
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Create Verification" title="Issue a verifiable document" />
          <CardContent>
            <form className="space-y-4" onSubmit={createVerification}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Document type</span>
                <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, documentType: event.target.value }))} value={formState.documentType}>
                  <option value="patient_health_card">Patient health card</option>
                  <option value="lab_report">Lab report</option>
                  <option value="vaccination_certificate">Vaccination certificate</option>
                  <option value="prescription">Prescription</option>
                  <option value="referral_letter">Referral letter</option>
                  <option value="medical_certificate">Medical certificate</option>
                </select>
              </label>
              <Input label="Document number" onChange={(event) => setFormState((current) => ({ ...current, documentNumber: event.target.value }))} value={formState.documentNumber} />
              <Input label="Issuing facility" onChange={(event) => setFormState((current) => ({ ...current, issuingFacility: event.target.value }))} value={formState.issuingFacility} />
              <Input label="Issue date" onChange={(event) => setFormState((current) => ({ ...current, issueDate: event.target.value }))} type="date" value={formState.issueDate} />
              <Input label="Masked patient ID" onChange={(event) => setFormState((current) => ({ ...current, patientMaskedIdentifier: event.target.value }))} value={formState.patientMaskedIdentifier} />
              <Input label="Resource type" onChange={(event) => setFormState((current) => ({ ...current, resourceType: event.target.value }))} value={formState.resourceType} />
              <Input label="Resource ID" onChange={(event) => setFormState((current) => ({ ...current, resourceId: event.target.value }))} value={formState.resourceId} />
              <Button size="lg" type="submit">Create verification</Button>
            </form>
            {result ? (
              <div className="mt-6 rounded-[1.4rem] border border-[var(--color-border)] p-4">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Verification created</p>
                <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">Token: {result.publicToken}</p>
                <a className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)]" href={publicUrl} rel="noreferrer" target="_blank">
                  Open public verification
                  <FiArrowUpRight size={16} />
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Public Verification" title="Check an issued document" />
          <CardContent>
            <form className="space-y-4" onSubmit={verifyLookup}>
              <Input icon={FiSearch} label="Public token" onChange={(event) => setLookupToken(event.target.value)} value={lookupToken} />
              <Button size="lg" type="submit" variant="secondary">Verify token</Button>
            </form>
            {lookupResult ? (
              <div className="mt-6 space-y-3 rounded-[1.4rem] border border-[var(--color-border)] p-4">
                <div className="flex items-center gap-2">
                  {lookupResult.valid ? <FiCheckCircle className="text-emerald-500" size={18} /> : <FiAlertTriangle className="text-rose-500" size={18} />}
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">{lookupResult.valid ? "Valid document" : "Document not valid"}</p>
                </div>
                <p className="text-sm text-[var(--color-foreground-muted)]">Type: {lookupResult.documentType}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">Number: {lookupResult.documentNumber || "Not available"}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">Facility: {lookupResult.issuingFacility || "Not available"}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">Issue date: {lookupResult.issueDate ? formatDate(lookupResult.issueDate) : "Not available"}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </OperationsPageScaffold>
  );
}

export function PublicVerificationPage() {
  const location = useLocation();
  const token = location.pathname.split("/").pop();
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/operations/verify/${token}`);
        setResult(response.data.data);
      } catch {
        setResult({ valid: false, status: "invalid", documentType: "unknown", documentNumber: "", issuingFacility: "" });
      }
    }

    if (token) {
      load();
    }
  }, [token]);

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[image:var(--gradient-brand)] text-white">
            {result?.valid ? <FiCheckCircle size={24} /> : <FiAlertTriangle size={24} />}
          </div>
          <div>
            <p className="ui-eyebrow">Public verification</p>
            <h1 className="ui-heading mt-2">{result?.valid ? "Document verified" : "Verification failed"}</h1>
          </div>
        </div>
        {result ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-0"><CardContent className="p-6"><p className="text-sm text-[var(--color-foreground-muted)]">Status</p><p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{result.status}</p></CardContent></Card>
            <Card className="p-0"><CardContent className="p-6"><p className="text-sm text-[var(--color-foreground-muted)]">Document type</p><p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{result.documentType}</p></CardContent></Card>
            <Card className="p-0"><CardContent className="p-6"><p className="text-sm text-[var(--color-foreground-muted)]">Document number</p><p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{result.documentNumber || "Not available"}</p></CardContent></Card>
            <Card className="p-0"><CardContent className="p-6"><p className="text-sm text-[var(--color-foreground-muted)]">Issuing facility</p><p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{result.issuingFacility || "Not available"}</p></CardContent></Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
