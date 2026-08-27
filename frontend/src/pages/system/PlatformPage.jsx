import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function PlatformPage() {
  const [state, setState] = useState({ organizations: [], facilities: [], featureFlags: [] });

  useEffect(() => {
    api.get("/platform/context").then((response) => setState(response.data.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/platform")}
        description="Multi-PHC context, tenant hierarchy, and backend-enforced feature flags are managed from this platform workspace."
        eyebrow="Platform"
        title="Organization and facility control"
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader eyebrow="Organizations" title={`Count: ${state.organizations.length}`} />
          <CardContent className="space-y-3">
            {state.organizations.map((item) => (
              <div key={item._id} className="rounded-2xl border border-[var(--color-border)] p-4">
                <p className="font-semibold text-[var(--color-foreground)]">{item.name}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{item.organizationCode}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Facilities" title={`Count: ${state.facilities.length}`} />
          <CardContent className="space-y-3">
            {state.facilities.map((item) => (
              <div key={item._id} className="rounded-2xl border border-[var(--color-border)] p-4">
                <p className="font-semibold text-[var(--color-foreground)]">{item.name}</p>
                <p className="text-sm text-[var(--color-foreground-muted)]">{item.facilityCode} • {item.facilityType}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Feature Flags" title="Backend enforced" />
          <CardContent className="space-y-3">
            {state.featureFlags.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
                <span className="font-medium text-[var(--color-foreground)]">{item.key}</span>
                <Badge tone={item.enabled ? "success" : "danger"}>{item.enabled ? "enabled" : "disabled"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
