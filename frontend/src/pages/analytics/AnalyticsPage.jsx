import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

function AnalyticsFilterBar({ filters, onChange, onApply }) {
  return (
    <Card>
      <CardHeader eyebrow="Shared Filters" title="Analytics filters and comparison" />
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Preset</span>
          <select
            className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
            onChange={(event) => onChange("preset", event.target.value)}
            value={filters.preset}
          >
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
            <option value="last_month">Last month</option>
            <option value="this_year">This year</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <Input label="From" onChange={(event) => onChange("from", event.target.value)} type="date" value={filters.from} />
        <Input label="To" onChange={(event) => onChange("to", event.target.value)} type="date" value={filters.to} />
        <Input label="Village" onChange={(event) => onChange("village", event.target.value)} value={filters.village} />
        <Input label="Department" onChange={(event) => onChange("department", event.target.value)} value={filters.department} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Comparison</span>
          <select
            className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
            onChange={(event) => onChange("comparison", event.target.value)}
            value={filters.comparison}
          >
            <option value="none">None</option>
            <option value="previous_period">Previous period</option>
            <option value="previous_month">Previous month</option>
            <option value="previous_year">Previous year</option>
          </select>
        </label>
        <div className="xl:col-span-6">
          <Button onClick={onApply} size="lg" type="button">Apply filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({ title, description, data = [] }) {
  const max = Math.max(...data.map((item) => item.value || item.count || 0), 1);

  return (
    <Card>
      <CardHeader description={description} eyebrow="Chart" title={title} />
      <CardContent className="space-y-4">
        {data.length ? (
          data.map((item) => {
            const value = item.value ?? item.count ?? 0;
            return (
              <div key={item.label || item.date || item.village || item.doctor || JSON.stringify(item)} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[var(--color-foreground)]">{item.label || item.date || item.village || item.doctor || item.diagnosis}</span>
                  <span className="text-[var(--color-foreground-muted)]">{value}</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--color-surface-strong)]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#2E7D32,#6bd388)]"
                    style={{ width: `${Math.max((value / max) * 100, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[var(--color-foreground-muted)]">Insufficient data for this chart.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryCards({ metrics = [] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <StatCard
          accent="linear-gradient(135deg,#2E7D32,#6bd388)"
          detail={
            item.comparison?.percentageChange === null || item.comparison?.percentageChange === undefined
              ? item.label
              : `${item.comparison.percentageChange}% vs previous`
          }
          key={item.key || item.label}
          label={item.label}
          value={String(item.value)}
        />
      ))}
    </section>
  );
}

function toEntries(object = {}) {
  return Object.entries(object).map(([label, value]) => ({ label, value: typeof value === "string" && value.startsWith("<") ? Number(value.replace(/\D/g, "")) : value }));
}

export function AnalyticsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("executive");
  const [filters, setFilters] = useState({
    preset: "this_month",
    from: "",
    to: "",
    village: "",
    department: "",
    comparison: "none",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data, setData] = useState({});

  useEffect(() => {
    async function loadAnalytics() {
      const params = Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => value));
      const endpoints = {
        executive: "/analytics/executive",
        patients: "/analytics/patients",
        appointments: "/analytics/appointments",
        queue: "/analytics/queue",
        doctors: "/analytics/doctors",
        pharmacy: "/analytics/pharmacy",
        laboratory: "/analytics/laboratory",
        vaccination: "/analytics/vaccination",
        village: "/analytics/village-health",
        disease: "/analytics/disease-trends",
        followUps: "/analytics/follow-ups",
        dataQuality: "/analytics/data-quality",
      };

      const response = await api.get(endpoints[activeTab], { params });
      setData(response.data.data);
    }

    loadAnalytics().catch(() => setData({}));
  }, [activeTab, appliedFilters]);

  const executiveMetrics = useMemo(() => data.metrics || [], [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Executive and operational analytics now run from live MongoDB aggregates with role-aware access and shared filters."
        eyebrow="Analytics"
        title="Advanced analytics"
      />

      <AnalyticsFilterBar
        filters={filters}
        onApply={() => setAppliedFilters(filters)}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <Tabs
        items={[
          { label: "Executive", value: "executive" },
          { label: "Patients", value: "patients" },
          { label: "Appointments", value: "appointments" },
          { label: "Queue", value: "queue" },
          { label: "Doctors", value: "doctors" },
          { label: "Pharmacy", value: "pharmacy" },
          { label: "Laboratory", value: "laboratory" },
          { label: "Vaccination", value: "vaccination" },
          { label: "Village", value: "village" },
          { label: "Disease", value: "disease" },
          { label: "Follow-ups", value: "followUps" },
          { label: "Data Quality", value: "dataQuality" },
        ]}
        onChange={setActiveTab}
        value={activeTab}
      />

      {activeTab === "executive" ? (
        <>
          <SummaryCards metrics={executiveMetrics} />
          <section className="grid gap-6 xl:grid-cols-2">
            <SimpleBarChart
              data={Object.entries(data.operations || {}).map(([label, value]) => ({ label, value }))}
              description="Real-time executive operational counts"
              title="Operational highlights"
            />
            <Card>
              <CardHeader eyebrow="Context" title="Executive notes" />
              <CardContent className="space-y-3 text-sm text-[var(--color-foreground-muted)]">
                <p>Metrics are aggregated from live appointments, visits, prescriptions, laboratory, and vaccination records.</p>
                <p>Comparison values are shown only where a previous period is available and meaningful.</p>
                <Badge tone="info">Last updated {data.lastUpdatedAt ? new Date(data.lastUpdatedAt).toLocaleString("en-IN") : "pending"}</Badge>
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}

      {activeTab === "patients" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SimpleBarChart data={Object.entries(data.distributions?.gender || {}).map(([label, value]) => ({ label, value }))} description="Registrations by gender" title="Gender distribution" />
          <SimpleBarChart data={Object.entries(data.distributions?.ageGroup || {}).map(([label, value]) => ({ label, value }))} description="Configured age bands" title="Age-group distribution" />
          <SimpleBarChart data={Object.entries(data.distributions?.village || {}).map(([label, value]) => ({ label, value: typeof value === "string" ? Number(value.replace(/\D/g, "")) : value }))} description="Village-level registrations with small-number protection" title="Village distribution" />
          <Card>
            <CardHeader eyebrow="Drill-down" title="High-frequency visitors" />
            <CardContent>
              <DataTable columns={[{ key: "patientId", label: "Patient ID" }, { key: "count", label: "Visits" }]} rows={data.drilldowns?.highFrequencyVisitors || []} />
            </CardContent>
          </Card>
        </section>
      ) : null}

      {activeTab === "appointments" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SimpleBarChart data={(data.trends?.byDay || []).map((item) => ({ label: item.date, value: item.count }))} description="Appointments across the selected period" title="Appointments by day" />
          <SimpleBarChart data={toEntries(data.distributions?.byDepartment)} description="Operational volume by department" title="By department" />
          <SimpleBarChart data={toEntries(data.distributions?.byDoctor)} description="Assigned appointments by doctor" title="By doctor" />
          <SimpleBarChart data={toEntries(data.distributions?.byStatus)} description="Lifecycle status split" title="Status distribution" />
        </section>
      ) : null}

      {activeTab === "queue" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader eyebrow="Metrics" title="Queue timing summary" />
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.entries(data.totals || {}).map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
                  <p className="text-sm text-[var(--color-foreground-muted)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <SimpleBarChart data={toEntries(data.trends?.byHour)} description="Patients served by queue hour bucket" title="Queue length by hour" />
        </section>
      ) : null}

      {["doctors", "pharmacy", "laboratory", "vaccination", "followUps"].includes(activeTab) ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader eyebrow="Metrics" title="Operational summary" />
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.entries(data.totals || {}).map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
                  <p className="text-sm text-[var(--color-foreground-muted)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <SimpleBarChart
            data={toEntries(
              data.distributions?.byDoctor ||
                data.distributions?.mostDispensedMedicines ||
                data.distributions?.byStatus ||
                data.distributions?.byVillage ||
                {},
            )}
            description="Top operational breakdown for the selected module"
            title="Primary distribution"
          />
        </section>
      ) : null}

      {activeTab === "village" ? (
        <Card>
          <CardHeader eyebrow="Village Health" title="Village comparison table" />
          <CardContent>
            <DataTable
              columns={[
                { key: "village", label: "Village" },
                { key: "registeredPatients", label: "Registered" },
                { key: "visits", label: "Visits" },
                { key: "vaccinations", label: "Vaccinations" },
              ]}
              rows={data.summary || []}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "disease" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SimpleBarChart data={(data.trends?.recordedDiagnosisTrend || []).map((item) => ({ label: item.date, value: item.count }))} description="Recorded diagnosis counts over time" title="Recorded diagnosis trend" />
          <SimpleBarChart data={(data.trends?.byDiagnosis || []).map((item) => ({ label: item.diagnosis, value: typeof item.count === "string" ? Number(item.count.replace(/\D/g, "")) : item.count }))} description="Most recorded diagnoses with suppression" title="Top diagnosis categories" />
        </section>
      ) : null}

      {activeTab === "dataQuality" ? (
        <Card>
          <CardHeader eyebrow="Data Quality" title="Quality indicators" />
          <CardContent>
            <DataTable
              columns={[
                { key: "label", label: "Indicator" },
                { key: "value", label: "Count" },
              ]}
              rows={Object.entries(data.indicators || {}).map(([label, value]) => ({ label, value }))}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader eyebrow="Next Actions" title="Report and export workflows" />
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/reports">
            <Button size="lg" type="button">Open reports workspace</Button>
          </Link>
          <Link to="/patients">
            <Button size="lg" type="button" variant="secondary">Open patient list</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
