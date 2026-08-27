import { useEffect, useMemo, useState } from "react";
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

function CatalogueForm({ onCreated }) {
  const [form, setForm] = useState({ testCode: "", testName: "", category: "hematology", specimenType: "Blood" });

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/laboratory/tests", form);
    setForm({ testCode: "", testName: "", category: "hematology", specimenType: "Blood" });
    await onCreated();
  }

  return (
    <Card>
      <CardHeader eyebrow="Catalogue" title="Add lab test" />
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Test code" onChange={(event) => setForm((current) => ({ ...current, testCode: event.target.value }))} value={form.testCode} />
          <Input label="Test name" onChange={(event) => setForm((current) => ({ ...current, testName: event.target.value }))} value={form.testName} />
          <Input label="Category" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} value={form.category} />
          <Input label="Specimen type" onChange={(event) => setForm((current) => ({ ...current, specimenType: event.target.value }))} value={form.specimenType} />
          <div className="md:col-span-2">
            <Button size="lg" type="submit">Create test</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LabRequestWorkspace({ request, onUpdated }) {
  const [resultForm, setResultForm] = useState({
    parameterName: "Result",
    value: "",
    unit: "",
    referenceRange: "",
    flag: "not_applicable",
    interpretation: "",
    criticalFlag: false,
    criticalReason: "",
  });

  if (!request) {
    return (
      <Card>
        <CardHeader eyebrow="Processing" title="Lab request workspace" />
        <CardContent>
          <p className="text-sm text-[var(--color-foreground-muted)]">Select a lab request to acknowledge, collect samples, enter results, and verify reports.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        description={`${request.patientId} • ${request.doctorName || "Doctor assigned"}`}
        eyebrow={request.requestNumber}
        title="Process lab request"
      />
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={async () => { await api.post(`/laboratory/requests/${request._id}/acknowledge`); await onUpdated(); }} size="sm" type="button">Acknowledge</Button>
          <Button onClick={async () => { await api.post(`/laboratory/requests/${request._id}/collect-sample`, { specimenType: request.tests?.[0]?.testName ? "Blood" : "Other", collectionLocation: "Main Lab" }); await onUpdated(); }} size="sm" type="button" variant="secondary">Collect sample</Button>
          <Button onClick={async () => { await api.post(`/laboratory/requests/${request._id}/start-processing`); await onUpdated(); }} size="sm" type="button" variant="ghost">Start processing</Button>
          <Button onClick={async () => { await api.post(`/laboratory/requests/${request._id}/verify`); await onUpdated(); }} size="sm" type="button" variant="ghost">Verify</Button>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await api.post(`/laboratory/requests/${request._id}/enter-result`, {
              parameters: [
                {
                  name: resultForm.parameterName,
                  value: resultForm.value,
                  unit: resultForm.unit,
                  referenceRange: resultForm.referenceRange,
                  flag: resultForm.flag,
                },
              ],
              interpretation: resultForm.interpretation,
              criticalFlag: resultForm.criticalFlag,
              criticalReason: resultForm.criticalReason,
            });
            setResultForm({
              parameterName: "Result",
              value: "",
              unit: "",
              referenceRange: "",
              flag: "not_applicable",
              interpretation: "",
              criticalFlag: false,
              criticalReason: "",
            });
            await onUpdated();
          }}
        >
          <Input label="Parameter" onChange={(event) => setResultForm((current) => ({ ...current, parameterName: event.target.value }))} value={resultForm.parameterName} />
          <Input label="Value" onChange={(event) => setResultForm((current) => ({ ...current, value: event.target.value }))} value={resultForm.value} />
          <Input label="Unit" onChange={(event) => setResultForm((current) => ({ ...current, unit: event.target.value }))} value={resultForm.unit} />
          <Input label="Reference range" onChange={(event) => setResultForm((current) => ({ ...current, referenceRange: event.target.value }))} value={resultForm.referenceRange} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Flag</span>
            <select
              className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
              onChange={(event) => setResultForm((current) => ({ ...current, flag: event.target.value }))}
              value={resultForm.flag}
            >
              <option value="not_applicable">Not applicable</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <Input label="Interpretation" onChange={(event) => setResultForm((current) => ({ ...current, interpretation: event.target.value }))} value={resultForm.interpretation} />
          <label className="mt-8 flex items-center gap-3 text-sm text-[var(--color-foreground-muted)]">
            <input checked={resultForm.criticalFlag} onChange={(event) => setResultForm((current) => ({ ...current, criticalFlag: event.target.checked }))} type="checkbox" />
            Mark as critical
          </label>
          <div className="md:col-span-2">
            <Input label="Critical reason" onChange={(event) => setResultForm((current) => ({ ...current, criticalReason: event.target.value }))} value={resultForm.criticalReason} />
          </div>
          <div className="md:col-span-2">
            <Button size="lg" type="submit">Save result</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function LaboratoryPage() {
  const location = useLocation();
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState("");

  async function loadAll() {
    const [requestsResponse, testsResponse, statsResponse] = await Promise.all([
      api.get("/laboratory/requests"),
      api.get("/laboratory/tests"),
      api.get("/laboratory/stats/daily"),
    ]);
    setRequests(requestsResponse.data.data);
    setTests(testsResponse.data.data);
    setStats(statsResponse.data.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const selectedRequest = useMemo(
    () => requests.find((item) => item._id === selectedRequestId) || requests[0] || null,
    [requests, selectedRequestId],
  );

  const statCards = stats
    ? [
        { label: "Requests", value: String(stats.requested), detail: "Today's load", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
        { label: "Samples Pending", value: String(stats.samplesPending), detail: "Need collection", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
        { label: "Processing", value: String(stats.processing), detail: "Active tests", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
        { label: "Critical", value: String(stats.criticalResults), detail: "Need escalation", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Lab request processing, sample collection, result entry, and verification are now connected to the live laboratory workflow."
        eyebrow="Laboratory"
        title="Laboratory operations"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <Tabs
        items={[
          { label: "Requests", value: "requests" },
          { label: "Catalogue", value: "catalogue" },
        ]}
        onChange={setTab}
        value={tab}
      />

      {tab === "requests" ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader eyebrow="Queue" title="Incoming lab requests" />
            <CardContent className="space-y-3">
              {requests.map((request) => (
                <button
                  className={`block w-full rounded-[1.5rem] border p-4 text-left ${
                    selectedRequest?._id === request._id ? "border-[var(--color-brand)] bg-[var(--color-surface-elevated)]" : "border-[var(--color-border)]"
                  }`}
                  key={request._id}
                  onClick={() => setSelectedRequestId(request._id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-foreground-muted)]">{request.requestNumber}</p>
                      <h4 className="mt-1 font-semibold text-[var(--color-foreground)]">{request.patientId}</h4>
                      <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{request.tests?.map((test) => test.testName).join(", ")}</p>
                    </div>
                    <Badge tone={request.priority === "emergency" ? "danger" : request.priority === "urgent" ? "warning" : "info"}>
                      {request.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          <LabRequestWorkspace onUpdated={loadAll} request={selectedRequest} />
        </section>
      ) : null}

      {tab === "catalogue" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <CatalogueForm onCreated={loadAll} />
          <Card>
            <CardHeader eyebrow="Configured Tests" title="Active test catalogue" />
            <CardContent>
              <DataTable
                columns={[
                  { key: "testCode", label: "Code" },
                  { key: "testName", label: "Test" },
                  { key: "category", label: "Category" },
                  { key: "specimenType", label: "Specimen" },
                ]}
                rows={tests}
              />
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
