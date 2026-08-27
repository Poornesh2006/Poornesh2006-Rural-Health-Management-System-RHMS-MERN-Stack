import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function AiGovernancePage() {
  const [governance, setGovernance] = useState({ usage: 0, failures: 0, approvalRate: 0, items: [], disclaimer: "" });
  const [patientId, setPatientId] = useState("");
  const [summary, setSummary] = useState(null);
  const [duplicates, setDuplicates] = useState(null);

  async function loadGovernance() {
    const response = await api.get("/platform/ai/governance");
    setGovernance(response.data.data);
  }

  useEffect(() => {
    loadGovernance().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/ai-governance")}
        description="Safe AI assistance remains review-only, redacted, and explicitly blocked from auto-saving clinical content."
        eyebrow="AI Governance"
        title="AI review and safety controls"
      />

      <Card>
        <CardHeader eyebrow="Policy" title="Review-only AI" />
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--color-foreground-muted)]">{governance.disclaimer}</p>
          <div className="flex flex-wrap gap-3">
            <Badge tone="info">Usage: {governance.usage}</Badge>
            <Badge tone="warning">Rejected: {governance.failures}</Badge>
            <Badge tone="success">Approval rate: {(governance.approvalRate * 100).toFixed(0)}%</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Visit summary" title="Generate draft summary" />
        <CardContent className="space-y-4">
          <Input label="Patient ID" onChange={(event) => setPatientId(event.target.value)} value={patientId} />
          <div className="flex gap-2">
            <Button onClick={async () => { const response = await api.post("/platform/ai/visit-summary", { patientId }); setSummary(response.data.data); await loadGovernance(); }} size="md" type="button">Generate</Button>
            <Button onClick={async () => { const response = await api.get("/platform/ai/duplicates"); setDuplicates(response.data.data); await loadGovernance(); }} size="md" type="button" variant="secondary">Check duplicates</Button>
          </div>
          {summary ? (
            <div className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-brand)]">{summary.disclaimer}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-foreground-muted)]">{summary.draft}</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={async () => { await api.post(`/platform/ai/reviews/${summary.auditId}`, { status: "accepted" }); await loadGovernance(); }} size="sm" type="button">Accept</Button>
                <Button onClick={async () => { await api.post(`/platform/ai/reviews/${summary.auditId}`, { status: "rejected", notes: "Rejected during review" }); await loadGovernance(); }} size="sm" type="button" variant="danger">Reject</Button>
              </div>
            </div>
          ) : null}
          {duplicates ? (
            <div className="space-y-3">
              {duplicates.matches.map((item, index) => (
                <div key={`${item.left.patientId}-${item.right.patientId}-${index}`} className="rounded-2xl border border-[var(--color-border)] p-4">
                  <p className="font-semibold text-[var(--color-foreground)]">{item.left.fullName} / {item.right.fullName}</p>
                  <p className="text-sm text-[var(--color-foreground-muted)]">Score: {item.score} • Matched: {item.matchedFields.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
