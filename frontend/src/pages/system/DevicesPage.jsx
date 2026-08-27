import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ deviceId: "", name: "", deviceType: "tablet", platform: "web", appVersion: "1.0.0" });

  async function loadDevices() {
    const response = await api.get("/platform/devices");
    setDevices(response.data.data);
  }

  useEffect(() => {
    loadDevices().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/devices")}
        description="Register, observe, and revoke trusted RHMS workstations, displays, and field devices."
        eyebrow="Devices"
        title="Device management"
      />

      <Card>
        <CardHeader eyebrow="Register" title="Add device" />
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={async (event) => {
            event.preventDefault();
            await api.post("/platform/devices", form);
            setForm({ deviceId: "", name: "", deviceType: "tablet", platform: "web", appVersion: "1.0.0" });
            await loadDevices();
          }}>
            <Input label="Device ID" onChange={(event) => setForm((current) => ({ ...current, deviceId: event.target.value }))} value={form.deviceId} />
            <Input label="Name" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
            <Input label="Type" onChange={(event) => setForm((current) => ({ ...current, deviceType: event.target.value }))} value={form.deviceType} />
            <Input label="Platform" onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))} value={form.platform} />
            <div className="md:col-span-2">
              <Button size="lg" type="submit">Register device</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Inventory" title="Trusted devices" />
        <CardContent className="space-y-3">
          {devices.map((item) => (
            <div key={item._id} className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="font-semibold text-[var(--color-foreground)]">{item.name}</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">{item.deviceId} • {item.deviceType} • {item.platform}</p>
              <div className="mt-3">
                {item.trustedStatus ? <Button onClick={async () => { await api.post(`/platform/devices/${item.deviceId}/revoke`); await loadDevices(); }} size="sm" type="button" variant="danger">Revoke</Button> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
