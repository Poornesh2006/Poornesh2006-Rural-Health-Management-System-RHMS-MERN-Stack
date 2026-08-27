import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { FilterBar } from "../../components/ui/FilterBar";
import { FloatingActionButton } from "../../components/ui/FloatingActionButton";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { offlineDb } from "../../services/offline-db";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function getRiskTone(chronicDiseases = []) {
  if (chronicDiseases.length >= 2) {
    return { label: "High", tone: "danger" };
  }

  if (chronicDiseases.length === 1) {
    return { label: "Moderate", tone: "warning" };
  }

  return { label: "Low", tone: "info" };
}

export function PatientListPage() {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await api.get("/patients", {
          params: { search },
        });
        setPatients(response.data.data.items);
        await offlineDb.set("cachedPatients", "patient-list", response.data.data.items);
      } catch {
        setPatients((await offlineDb.get("cachedPatients", "patient-list")) || []);
      }
    }

    loadPatients();
  }, [search]);

  const rows = useMemo(
    () =>
      patients.map((patient) => {
        const risk = getRiskTone(patient.medicalFlags?.chronicDiseases || []);

        return {
          id: patient.patientId,
          name: patient.fullName,
          patientId: patient.patientId,
          village: patient.address?.village || "Unknown",
          lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString("en-IN") : "New",
          status: patient.status,
          risk,
        };
      }),
    [patients],
  );

  const columns = [
    { key: "name", label: "Patient" },
    { key: "patientId", label: "Patient ID" },
    { key: "village", label: "Village" },
    { key: "lastVisit", label: "Last Activity" },
    {
      key: "status",
      label: "Status",
      render: (value) => <Badge tone={value === "archived" ? "danger" : "success"}>{value}</Badge>,
    },
    {
      key: "risk",
      label: "Risk",
      render: (value) => <Badge tone={value.tone}>{value.label}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/patients/${row.patientId}`}>
            <Button size="sm" type="button" variant="secondary">
              View
            </Button>
          </Link>
          <a
            href={`https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(`rhms://patient/${row.patientId}`)}`}
            rel="noreferrer"
            target="_blank"
          >
            <Button size="sm" type="button" variant="ghost">
              QR
            </Button>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link to="/patients/register">
            <Button size="lg" type="button">Register patient</Button>
          </Link>
        }
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="This page now loads patient records from MongoDB through the secured patient API."
        eyebrow="Patients"
        title="Patient registry and triage overview"
      />

      <Card>
        <CardContent className="mt-0 space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <SearchBar className="w-full" placeholder="Search by patient ID, phone, village..." />
              <div className="mt-3">
                <Input
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Type to search live records..."
                  value={search}
                />
              </div>
            </div>
            <FilterBar filters={["All Status", "High Risk", "Village", "Recent Visits"]} />
          </div>

          <DataTable columns={columns} rows={rows} />
        </CardContent>
      </Card>
      <FloatingActionButton label="Add patient" to="/patients/register" />
    </div>
  );
}
