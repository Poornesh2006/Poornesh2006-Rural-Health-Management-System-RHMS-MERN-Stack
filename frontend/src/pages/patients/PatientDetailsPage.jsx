import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { EmptyState } from "../../components/ui/EmptyState";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function PatientDetailsPage() {
  const location = useLocation();
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadPatientProfile() {
      try {
        const response = await api.get(`/patients/${patientId}/clinical-profile`);
        setProfile(response.data.data);
      } catch {
        setProfile(null);
      }
    }

    loadPatientProfile();
  }, [patientId]);

  const patient = profile?.patient;
  const visits = profile?.visits || [];
  const prescriptions = profile?.prescriptions || [];
  const labResults = profile?.labResults || [];
  const vaccinations = profile?.vaccinations || [];
  const timeline = profile?.timeline || [];

  if (!patient) {
    return <EmptyState description="We could not load this patient record." title="Patient not available" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Patient details, QR identity, clinical tabs, and longitudinal timeline are now loaded from the patient APIs."
        eyebrow="Patient Details"
        title={patient.fullName}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            description={`${patient.gender}, ${patient.age || "Age pending"} years, ${patient.address?.village || "Village pending"}`}
            eyebrow={patient.patientId}
            title="Unified patient profile"
          />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="success">{patient.status}</Badge>
                <Badge tone="info">{patient.bloodGroup || "Blood group pending"}</Badge>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Emergency contact</p>
              <p className="mt-2 font-semibold text-[var(--color-foreground)]">+91 {patient.emergencyContact || patient.phone}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">QR Identity</p>
              <img
                alt={`QR code for ${patient.fullName}`}
                className="mt-3 h-28 w-28 rounded-2xl border border-[var(--color-border)] bg-white p-2"
                src={`https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(patient.qrCodeValue)}`}
              />
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Last updated</p>
              <p className="mt-2 font-semibold text-[var(--color-foreground)]">{new Date(patient.updatedAt).toLocaleDateString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow="Timeline" title="Recent medical activity" />
          <CardContent className="space-y-5">
            {visits.length ? (
              timeline.slice(0, 8).map((event, index) => (
                <div key={`${event.type}-${event.date}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-brand)]" />
                    {index < timeline.length - 1 ? <div className="mt-2 h-full w-px bg-[var(--color-border)]" /> : null}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      {new Date(event.date).toLocaleDateString("en-IN")}
                    </p>
                    <h4 className="mt-1 font-semibold text-[var(--color-foreground)]">{event.title}</h4>
                    <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{event.note}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState description="No visit history has been recorded for this patient yet." title="No visits yet" />
            )}
          </CardContent>
        </Card>
      </section>

      <Tabs
        items={[
          { label: "Overview", value: "overview" },
          { label: "Visits", value: "visits" },
          { label: "Prescriptions", value: "prescriptions" },
          { label: "Lab Reports", value: "lab" },
          { label: "Vaccination", value: "vaccination" },
          { label: "Documents", value: "documents" },
        ]}
        onChange={setActiveTab}
        value={activeTab}
      />

      {activeTab === "overview" ? (
        <Card>
          <CardHeader eyebrow="Summary" title="Clinical overview" />
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Total visits</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{visits.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Prescriptions</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{prescriptions.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-foreground-muted)]">Vaccinations</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{vaccinations.length}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "visits" ? (
        <Card>
          <CardHeader eyebrow="Visits" title="Visit history" />
          <CardContent>
            <DataTable
              columns={[
                { key: "visitId", label: "Visit ID" },
                { key: "visitDate", label: "Date", render: (value) => new Date(value).toLocaleDateString("en-IN") },
                { key: "diagnosis", label: "Diagnosis" },
                { key: "visitStatus", label: "Status", render: (value) => <Badge tone={value === "completed" ? "success" : "warning"}>{value}</Badge> },
              ]}
              rows={visits}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "prescriptions" ? (
        <Card>
          <CardHeader eyebrow="Pharmacy" title="Prescription history" />
          <CardContent>
            <DataTable
              columns={[
                { key: "prescriptionNumber", label: "Prescription" },
                { key: "doctorName", label: "Doctor" },
                { key: "issuedAt", label: "Issued", render: (value) => new Date(value).toLocaleDateString("en-IN") },
                { key: "status", label: "Status", render: (value) => <Badge tone={value === "fully_dispensed" ? "success" : value === "partially_dispensed" ? "warning" : "info"}>{value}</Badge> },
              ]}
              rows={prescriptions}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "lab" ? (
        <Card>
          <CardHeader eyebrow="Laboratory" title="Lab results" />
          <CardContent>
            <DataTable
              columns={[
                { key: "testName", label: "Test" },
                { key: "updatedAt", label: "Updated", render: (value) => new Date(value).toLocaleDateString("en-IN") },
                { key: "criticalFlag", label: "Critical", render: (value) => <Badge tone={value ? "danger" : "success"}>{value ? "critical" : "normal"}</Badge> },
                { key: "reviewNote", label: "Doctor note" },
              ]}
              rows={labResults}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "vaccination" ? (
        <Card>
          <CardHeader eyebrow="Immunization" title="Vaccination history" />
          <CardContent>
            <DataTable
              columns={[
                { key: "certificateNumber", label: "Certificate" },
                { key: "doseNumber", label: "Dose" },
                { key: "administeredDate", label: "Date", render: (value) => new Date(value).toLocaleDateString("en-IN") },
                { key: "nextDoseDate", label: "Next due", render: (value) => value ? new Date(value).toLocaleDateString("en-IN") : "Not scheduled" },
              ]}
              rows={vaccinations}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "documents" ? (
        <EmptyState
          description="Generated certificates, reports, and slips are now linked through their source module records. A dedicated document browser can be added in the next phase."
          title="Document integration foundation active"
        />
      ) : null}
    </div>
  );
}
