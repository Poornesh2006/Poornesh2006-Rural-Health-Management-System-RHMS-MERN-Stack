import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import {
  appointmentSummary,
  labCards,
  medicineInventory,
  queueColumns,
  reportCategories,
  settingsSections,
  faqItems,
} from "../../data/mockAppData";
import { useConnectivity } from "../../context/ConnectivityContext";
import { offlineDb } from "../../services/offline-db";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function PageScaffold({ eyebrow, title, description, actionLabel, filters, searchPlaceholder, children }) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        actions={actionLabel ? <Button size="lg" type="button">{actionLabel}</Button> : null}
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar className="w-full lg:max-w-md" placeholder={searchPlaceholder} />
        <FilterBar filters={filters} />
      </div>
      {children}
    </div>
  );
}

export function RegisterPatientPage() {
  const navigate = useNavigate();
  const { isOnline, queueMutation } = useConnectivity();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "female",
    phone: "",
    bloodGroup: "",
    village: "",
    district: "",
    state: "Tamil Nadu",
    pinCode: "",
    guardianName: "",
    emergencyContact: "",
    occupation: "",
    insurance: "",
    disability: "",
    medicalHistory: "",
    chronicDiseases: "",
    allergies: "",
    currentMedications: "",
    heightCm: "",
    weightKg: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    offlineDb.get("draftForms", "patient-registration").then((draft) => {
      if (draft) {
        setFormState((current) => ({ ...current, ...draft }));
      }
    });
  }, []);

  useEffect(() => {
    offlineDb.set("draftForms", "patient-registration", formState);
  }, [formState]);

  async function runDuplicateCheck() {
    const hasEnoughInput = formState.firstName && (formState.phone || formState.dateOfBirth || formState.village);

    if (!isOnline || !hasEnoughInput) {
      setDuplicateMatches([]);
      return [];
    }

    setCheckingDuplicates(true);

    try {
      const response = await api.post("/patients/duplicate-check", {
        firstName: formState.firstName,
        lastName: formState.lastName,
        dateOfBirth: formState.dateOfBirth,
        phone: formState.phone,
        village: formState.village,
        guardianName: formState.guardianName,
        gender: formState.gender,
      });
      setDuplicateMatches(response.data.data);
      return response.data.data;
    } catch {
      setDuplicateMatches([]);
      return [];
    } finally {
      setCheckingDuplicates(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const payload = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      dateOfBirth: formState.dateOfBirth,
      gender: formState.gender,
      phone: formState.phone,
      bloodGroup: formState.bloodGroup,
      guardianName: formState.guardianName,
      emergencyContact: formState.emergencyContact,
      occupation: formState.occupation,
      insurance: formState.insurance,
      disability: formState.disability,
      address: {
        village: formState.village,
        district: formState.district,
        state: formState.state,
        pinCode: formState.pinCode,
      },
      medicalFlags: {
        medicalHistory: formState.medicalHistory ? formState.medicalHistory.split(",").map((item) => item.trim()).filter(Boolean) : [],
        chronicDiseases: formState.chronicDiseases ? formState.chronicDiseases.split(",").map((item) => item.trim()).filter(Boolean) : [],
        allergies: formState.allergies ? formState.allergies.split(",").map((item) => item.trim()).filter(Boolean) : [],
        currentMedications: formState.currentMedications ? formState.currentMedications.split(",").map((item) => item.trim()).filter(Boolean) : [],
      },
      vitals: {
        heightCm: formState.heightCm ? Number(formState.heightCm) : undefined,
        weightKg: formState.weightKg ? Number(formState.weightKg) : undefined,
      },
    };

    try {
      if (!isOnline) {
        await queueMutation({ method: "post", url: "/patients", body: payload });
        setErrorMessage("Saved offline. This registration will synchronize when connection returns.");
        return;
      }

      const matches = await runDuplicateCheck();
      if (matches.some((item) => item.matchPercentage >= 70)) {
        setErrorMessage("Possible duplicate patient found. Review the suggested matches below before creating a new record.");
        return;
      }

      const response = await api.post("/patients", payload);

      await offlineDb.set("draftForms", "patient-registration", null);
      navigate(`/patients/${response.data.data.patientId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to register patient");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/patients/register")}
        description="This registration form is now connected to the secured patient creation API."
        eyebrow="Registration"
        title="Register patient"
      />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="First name" onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))} value={formState.firstName} />
          <Input label="Last name" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))} value={formState.lastName} />
          <Input label="Date of birth" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, dateOfBirth: event.target.value }))} type="date" value={formState.dateOfBirth} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Gender</span>
            <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, gender: event.target.value }))} value={formState.gender}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <Input label="Phone" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} value={formState.phone} />
          <Input label="Blood group" onChange={(event) => setFormState((current) => ({ ...current, bloodGroup: event.target.value }))} value={formState.bloodGroup} />
          <Input label="Village" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, village: event.target.value }))} value={formState.village} />
          <Input label="District" onChange={(event) => setFormState((current) => ({ ...current, district: event.target.value }))} value={formState.district} />
          <Input label="PIN code" onChange={(event) => setFormState((current) => ({ ...current, pinCode: event.target.value }))} value={formState.pinCode} />
          <Input label="Guardian" onChange={(event) => setFormState((current) => ({ ...current, guardianName: event.target.value }))} value={formState.guardianName} />
          <Input label="Emergency contact" onChange={(event) => setFormState((current) => ({ ...current, emergencyContact: event.target.value }))} value={formState.emergencyContact} />
          <Input label="Occupation" onChange={(event) => setFormState((current) => ({ ...current, occupation: event.target.value }))} value={formState.occupation} />
          <Input label="Insurance" onChange={(event) => setFormState((current) => ({ ...current, insurance: event.target.value }))} value={formState.insurance} />
          <Input label="Disability" onChange={(event) => setFormState((current) => ({ ...current, disability: event.target.value }))} value={formState.disability} />
          <Input label="Height (cm)" onChange={(event) => setFormState((current) => ({ ...current, heightCm: event.target.value }))} type="number" value={formState.heightCm} />
          <Input label="Weight (kg)" onChange={(event) => setFormState((current) => ({ ...current, weightKg: event.target.value }))} type="number" value={formState.weightKg} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Input hint="Comma separated" label="Medical history" onChange={(event) => setFormState((current) => ({ ...current, medicalHistory: event.target.value }))} value={formState.medicalHistory} />
          <Input hint="Comma separated" label="Chronic diseases" onChange={(event) => setFormState((current) => ({ ...current, chronicDiseases: event.target.value }))} value={formState.chronicDiseases} />
          <Input hint="Comma separated" label="Allergies" onChange={(event) => setFormState((current) => ({ ...current, allergies: event.target.value }))} value={formState.allergies} />
          <Input hint="Comma separated" label="Current medications" onChange={(event) => setFormState((current) => ({ ...current, currentMedications: event.target.value }))} value={formState.currentMedications} />
        </section>

        {checkingDuplicates ? <p className="text-sm text-[var(--color-foreground-muted)]">Checking for similar patient records...</p> : null}
        {duplicateMatches.length ? (
          <div className="rounded-[1.6rem] border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-1 text-amber-400" size={18} />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Possible duplicate records found</p>
                {duplicateMatches.map((match) => (
                  <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3" key={match.patientId}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{match.fullName}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">Match {match.matchPercentage}% | {match.matchingFields.join(", ") || "manual review needed"}</p>
                      </div>
                      <Link to={`/patients/${match.patientId}`}>
                        <Button size="sm" type="button" variant="secondary">Open patient</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <Button size="lg" type="submit">{saving ? "Saving..." : "Create patient record"}</Button>
          <Link to="/patients">
            <Button size="lg" type="button" variant="secondary">Back to patient list</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export function VisitHistoryPage() {
  return (
    <PageScaffold
      description="Clinical history timeline, filters, and longitudinal review scaffolding for reception and doctors."
      eyebrow="Visit History"
      filters={["This Week", "Doctor", "Chronic Cases"]}
      searchPlaceholder="Search by visit ID, diagnosis, or patient..."
      title="Visit history"
    >
      <EmptyState
        description="Patient-level visit timelines are now live inside each patient profile. This global page remains ready for broader search and filtering."
        title="Visit timeline workspace ready"
      />
    </PageScaffold>
  );
}

export function AppointmentsPage() {
  return (
    <PageScaffold
      actionLabel="Book appointment"
      description="Unified appointment list, calendar shortcuts, and operational scheduling summary."
      eyebrow="Appointments"
      filters={["Upcoming", "Completed", "Cancelled"]}
      searchPlaceholder="Search by patient, doctor, or slot..."
      title="Appointments"
    >
      <section className="grid gap-4 md:grid-cols-3">
        {appointmentSummary.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>
      <EmptyState description="List and booking workflows remain scheduled for a later phase." title="Appointment workbench prepared" />
    </PageScaffold>
  );
}

export function CalendarPage() {
  return (
    <PageScaffold actionLabel="New slot" description="Calendar-first operational view for patient booking and clinician block management." eyebrow="Calendar" filters={["Day", "Week", "Month"]} searchPlaceholder="Search for calendar events..." title="Appointment calendar">
      <Card>
        <CardHeader eyebrow="Calendar Canvas" title="Scheduling grid placeholder" />
        <CardContent>
          <EmptyState description="This visual placeholder stands in for the premium calendar surface that will be connected next." title="Calendar layout staged" />
        </CardContent>
      </Card>
    </PageScaffold>
  );
}

export function QueuePage() {
  return (
    <PageScaffold actionLabel="Generate token" description="Token queue operations with separate states for waiting, current, completed, and emergency cases." eyebrow="Queue" filters={["Current", "Emergency", "Completed"]} searchPlaceholder="Search token, patient, or service desk..." title="Token queue">
      <DataTable
        columns={[
          { key: "token", label: "Token" },
          { key: "patient", label: "Patient" },
          { key: "desk", label: "Desk" },
          { key: "status", label: "Status", render: (value) => <Badge tone={value === "Emergency" ? "danger" : value === "Current" ? "info" : "neutral"}>{value}</Badge> },
          { key: "priority", label: "Priority" },
        ]}
        rows={queueColumns}
      />
    </PageScaffold>
  );
}

export function WaitingQueuePage() {
  return (
    <PageScaffold description="Dedicated waiting-room surface for triage and front-desk monitoring." eyebrow="Waiting Queue" filters={["Normal", "Priority", "Emergency"]} searchPlaceholder="Search waiting patients..." title="Waiting queue">
      <EmptyState description="Waiting-room state transitions and live updates will be connected with real-time APIs in a later phase." title="Waiting room surface prepared" />
    </PageScaffold>
  );
}

export function DoctorsPage() {
  return (
    <PageScaffold description="Doctor workspace landing page for consultation load, patient search, and certificates." eyebrow="Doctors" filters={["Available", "Consulting", "Follow-ups"]} searchPlaceholder="Search doctors or assigned queues..." title="Doctor dashboard">
      <EmptyState description="This page is ready to receive doctor-specific widgets, consultation lists, and note flows." title="Doctor workspace prepared" />
    </PageScaffold>
  );
}

export function PharmacyPage() {
  return (
    <PageScaffold description="Inventory, low-stock alerts, expiry risk, and medicine issuing UX for pharmacy operations." eyebrow="Pharmacy" filters={["Low Stock", "Expiring", "Suppliers"]} searchPlaceholder="Search medicine, batch, or supplier..." title="Pharmacy inventory">
      <section className="grid gap-4 md:grid-cols-3">
        {medicineInventory.map((item) => (
          <Card key={item.name} hover>
            <CardHeader eyebrow={item.state} title={item.name} />
            <CardContent>
              <p className="text-sm text-[var(--color-foreground-muted)]">Stock: {item.stock}</p>
              <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">Expiry: {item.expiry}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </PageScaffold>
  );
}

export function LaboratoryPage() {
  return (
    <PageScaffold actionLabel="Upload report" description="Drag-and-drop upload surface, pending lab workflow, and completed diagnostics presentation." eyebrow="Laboratory" filters={["Pending", "Completed", "Urgent"]} searchPlaceholder="Search report, patient, or test type..." title="Laboratory">
      <section className="grid gap-4 md:grid-cols-3">
        {labCards.map((item) => (
          <StatCard accent="linear-gradient(135deg,#0c879d,#84dbe4)" detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>
      <EmptyState description="The upload workflow UI and report preview shells are ready to be integrated with storage later." title="Lab operations page prepared" />
    </PageScaffold>
  );
}

export function VaccinationPage() {
  return (
    <PageScaffold description="Schedule, due dates, maternal-child reminders, and vaccination coverage workspace." eyebrow="Vaccination" filters={["Children", "Adults", "Pregnancy"]} searchPlaceholder="Search patient, vaccine, or due date..." title="Vaccination">
      <EmptyState description="Vaccination history, reminders, and government schedule panels will be added onto this shell." title="Vaccination program view prepared" />
    </PageScaffold>
  );
}

export function ReportsPage() {
  return (
    <PageScaffold actionLabel="Generate report" description="Export-oriented page for patient, doctor, medicine, village, and appointment reporting." eyebrow="Reports" filters={["PDF", "Excel", "Printable"]} searchPlaceholder="Search report template or category..." title="Reports">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCategories.map((item) => (
          <Card key={item} hover>
            <CardHeader eyebrow="Export Ready" title={item} />
            <CardContent>
              <p className="text-sm text-[var(--color-foreground-muted)]">Professional export entry point for {item.toLowerCase()}.</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </PageScaffold>
  );
}

export function AnalyticsPage() {
  return (
    <PageScaffold description="Mock analytics shell for growth, demographics, disease trends, and village-level public health insight." eyebrow="Analytics" filters={["Patients", "Diseases", "Villages"]} searchPlaceholder="Search dashboard metric or cohort..." title="Analytics">
      <section className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader eyebrow="Growth" title="Patient trend visualization" /><CardContent><EmptyState description="Chart component slot with realistic data visualization to be expanded later." title="Trend chart staged" /></CardContent></Card>
        <Card><CardHeader eyebrow="Demographics" title="Gender and age split" /><CardContent><EmptyState description="Pie and distribution chart areas are visually reserved here." title="Demographic charts staged" /></CardContent></Card>
        <Card><CardHeader eyebrow="Village Health" title="Coverage and disease heat map" /><CardContent><EmptyState description="Heat map and community metrics panels will attach to analytics services later." title="Village analytics staged" /></CardContent></Card>
      </section>
    </PageScaffold>
  );
}

export function NotificationsPage() {
  return (
    <PageScaffold description="Central inbox for SMS, email, push reminders, and operational escalation alerts." eyebrow="Notifications" filters={["Unread", "Reminders", "System"]} searchPlaceholder="Search alerts or recipients..." title="Notification center">
      <EmptyState description="Notification orchestration will be connected after backend messaging integrations are introduced." title="Notification workspace prepared" />
    </PageScaffold>
  );
}

export function SettingsPage() {
  return (
    <PageScaffold description="Modern settings layout for account, hospital information, theme, security, and backup preferences." eyebrow="Settings" filters={["Profile", "Theme", "Security"]} searchPlaceholder="Search setting or policy..." title="Settings">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {settingsSections.map((item) => (
          <Card key={item} hover>
            <CardHeader eyebrow="Settings Section" title={item} />
            <CardContent>
              <p className="text-sm text-[var(--color-foreground-muted)]">{item} controls and configuration surface.</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </PageScaffold>
  );
}

export function HelpPage() {
  return (
    <PageScaffold description="Support and onboarding area for FAQ, documentation, contact paths, and product versioning." eyebrow="Help Center" filters={["FAQ", "Contact", "Support"]} searchPlaceholder="Search help topics..." title="Help center">
      <section className="grid gap-4 xl:grid-cols-3">
        {faqItems.map((item) => (
          <Card key={item.q}>
            <CardHeader eyebrow="FAQ" title={item.q} />
            <CardContent>
              <p className="text-sm text-[var(--color-foreground-muted)]">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="flex gap-3">
        <Link to="/settings">
          <Button size="lg" type="button" variant="secondary">Open settings</Button>
        </Link>
        <Link to="/notifications">
          <Button size="lg" type="button">Open alerts</Button>
        </Link>
      </div>
    </PageScaffold>
  );
}
