import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function OutreachPage() {
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState({ village: "", date: "", expectedPatients: 0, summary: "" });

  async function loadCamps() {
    const response = await api.get("/platform/outreach-camps");
    setCamps(response.data.data);
  }

  useEffect(() => {
    loadCamps().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/outreach")}
        description="Field-health and outreach-camp workflows for village service delivery, offline capture, and facility-linked reporting."
        eyebrow="Outreach"
        title="Outreach camp management"
      />

      <Card>
        <CardHeader eyebrow="Camp" title="Create outreach camp" />
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            await api.post("/platform/outreach-camps", form);
            setForm({ village: "", date: "", expectedPatients: 0, summary: "" });
            await loadCamps();
          }}>
            <Input label="Village" onChange={(event) => setForm((current) => ({ ...current, village: event.target.value }))} value={form.village} />
            <Input label="Date" onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} type="date" value={form.date} />
            <Input label="Expected Patients" onChange={(event) => setForm((current) => ({ ...current, expectedPatients: Number(event.target.value) }))} type="number" value={String(form.expectedPatients)} />
            <Input label="Summary" onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} value={form.summary} />
            <div className="md:col-span-2">
              <Button size="lg" type="submit">Create camp</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Activity" title="Existing camps" />
        <CardContent className="space-y-3">
          {camps.map((item) => (
            <div key={item._id} className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="font-semibold text-[var(--color-foreground)]">{item.campNumber}</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">{item.village} • {new Date(item.date).toLocaleDateString("en-IN")} • {item.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
