import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [form, setForm] = useState({ patientId: "", destinationFacility: "", reason: "", urgency: "routine", consentId: "" });

  async function loadAll() {
    const [referralResponse, contextResponse, consentResponse] = await Promise.all([
      api.get("/platform/referrals"),
      api.get("/platform/context"),
      api.get("/platform/consents"),
    ]);

    setReferrals(referralResponse.data.data);
    setForm((current) => ({
      ...current,
      destinationFacility: current.destinationFacility || contextResponse.data.data.facilities?.find((item) => item._id !== contextResponse.data.data.activeFacilityId)?._id || "",
      consentId: current.consentId || consentResponse.data.data?.[0]?._id || "",
    }));
  }

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/referrals")}
        description="Consent-controlled inter-facility referral creation, status tracking, and document sharing."
        eyebrow="Referrals"
        title="Referral management"
      />

      <Card>
        <CardHeader eyebrow="Create" title="Send referral" />
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            await api.post("/platform/referrals", form);
            setForm({ patientId: "", destinationFacility: "", reason: "", urgency: "routine", consentId: "" });
            await loadAll();
          }}>
            <Input label="Patient ID" onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))} value={form.patientId} />
            <Input label="Destination Facility ID" onChange={(event) => setForm((current) => ({ ...current, destinationFacility: event.target.value }))} value={form.destinationFacility} />
            <Input label="Reason" onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} value={form.reason} />
            <Input label="Consent ID" onChange={(event) => setForm((current) => ({ ...current, consentId: event.target.value }))} value={form.consentId} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Urgency</span>
              <select className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))} value={form.urgency}>
                <option value="routine">Routine</option>
                <option value="priority">Priority</option>
                <option value="urgent">Urgent</option>
                <option value="emergency-transfer">Emergency transfer</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <Button size="lg" type="submit">Create referral</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Workflow" title="Existing referrals" />
        <CardContent className="space-y-3">
          {referrals.map((item) => (
            <div key={item._id} className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="font-semibold text-[var(--color-foreground)]">{item.referralNumber}</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">{item.reason} • {item.status}</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={async () => { await api.post(`/platform/referrals/${item._id}/status`, { status: "accepted" }); await loadAll(); }} size="sm" type="button" variant="secondary">Accept</Button>
                <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/platform/referrals/${item._id}/pdf`} target="_blank" rel="noreferrer">
                  <Button size="sm" type="button" variant="ghost">PDF</Button>
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
