import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { StatCard } from "../../components/ui/StatCard";
import { useConnectivity } from "../../context/ConnectivityContext";
import { offlineDb } from "../../services/offline-db";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function AppointmentForm({ doctors, onCreated }) {
  const { isOnline, queueMutation } = useConnectivity();
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [form, setForm] = useState({
    doctorId: "",
    department: "General OP",
    appointmentDate: getTodayDate(),
    startTime: "",
    endTime: "",
    appointmentType: "general_consultation",
    bookingSource: "reception",
    reason: "",
    symptomsSummary: "",
    priority: "normal",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function searchPatients() {
      try {
        const response = await api.get("/patients", { params: { search: patientSearch } });
        setPatients(response.data.data.items);
      } catch {
        setPatients([]);
      }
    }

    searchPatients();
  }, [patientSearch]);

  useEffect(() => {
    async function loadSlots() {
      if (!form.doctorId || !form.appointmentDate) {
        setSlots([]);
        return;
      }

      try {
        const response = await api.get("/doctor-schedules/slots", {
          params: {
            doctorId: form.doctorId,
            date: form.appointmentDate,
          },
        });
        setSlots(response.data.data);
      } catch {
        setSlots([]);
      }
    }

    loadSlots();
  }, [form.appointmentDate, form.doctorId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const payload = {
      patientId: selectedPatientId,
      doctorId: form.doctorId,
      doctorName: doctors.find((doctor) => doctor._id === form.doctorId)?.fullName || "",
      department: form.department,
      appointmentDate: form.appointmentDate,
      startTime: form.startTime,
      endTime: form.endTime,
      appointmentType: form.appointmentType,
      bookingSource: form.bookingSource,
      reason: form.reason,
      symptomsSummary: form.symptomsSummary,
      priority: form.priority,
    };

    try {
      if (!isOnline) {
        await queueMutation({ method: "post", url: "/appointments", body: payload });
        setErrorMessage("Appointment saved offline and queued for sync.");
        return;
      }

      await api.post("/appointments", payload);

      await onCreated();
      setSelectedPatientId("");
      setPatientSearch("");
      setForm((current) => ({ ...current, reason: "", symptomsSummary: "", startTime: "", endTime: "" }));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to book appointment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader
        description="Book a patient appointment, confirm doctor slot availability, and create the operational record."
        eyebrow="Appointment Booking"
        title="Book a new appointment"
      />
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Search patient</label>
              <input
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Search by patient ID or name"
                value={patientSearch}
              />
              <div className="mt-2 max-h-40 space-y-2 overflow-auto">
                {patients.map((patient) => (
                  <button
                    className={`block w-full rounded-2xl border px-3 py-2 text-left text-sm ${
                      selectedPatientId === patient.patientId
                        ? "border-[var(--color-brand)] bg-[var(--color-surface-elevated)]"
                        : "border-[var(--color-border)]"
                    }`}
                    key={patient.patientId}
                    onClick={() => setSelectedPatientId(patient.patientId)}
                    type="button"
                  >
                    {patient.fullName} ({patient.patientId})
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Doctor</span>
              <select
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, doctorId: event.target.value }))}
                value={form.doctorId}
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>{doctor.fullName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Appointment date</span>
              <input
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, appointmentDate: event.target.value }))}
                type="date"
                value={form.appointmentDate}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Available slot</span>
              <select
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => {
                  const [startTime, endTime] = event.target.value.split("|");
                  setForm((current) => ({ ...current, startTime, endTime }));
                }}
                value={form.startTime && form.endTime ? `${form.startTime}|${form.endTime}` : ""}
              >
                <option value="">Select slot</option>
                {slots.map((slot) => (
                  <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}|${slot.endTime}`}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Priority</span>
              <select
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                value={form.priority}
              >
                <option value="normal">Normal</option>
                <option value="senior_citizen">Senior citizen</option>
                <option value="pregnant">Pregnant</option>
                <option value="child">Child</option>
                <option value="disability">Disability</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Reason</span>
              <input
                className="glass-panel w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-3 text-sm"
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                value={form.reason}
              />
            </label>
          </div>
          {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}
          <Button size="lg" type="submit">{saving ? "Booking..." : "Create appointment"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AppointmentsPage() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");

  async function loadAppointments() {
    try {
      const response = await api.get("/appointments", { params: { search } });
      setAppointments(response.data.data.items);
      await offlineDb.set("cachedQueue", "appointments", response.data.data.items);
    } catch {
      setAppointments((await offlineDb.get("cachedQueue", "appointments")) || []);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [search]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const response = await api.get("/users", { params: { role: "doctor" } });
        setDoctors(response.data.data.items);
      } catch {
        setDoctors([]);
      }
    }

    loadDoctors();
  }, []);

  const stats = useMemo(() => {
    const waiting = appointments.filter((item) => ["waiting", "checked_in", "called"].includes(item.status)).length;
    const completed = appointments.filter((item) => item.status === "completed").length;
    const emergency = appointments.filter((item) => item.priority === "emergency").length;

    return [
      { label: "Appointments", value: String(appointments.length), detail: "Current working set", accent: "linear-gradient(135deg,#2E7D32,#6bd388)" },
      { label: "Waiting", value: String(waiting), detail: "Checked in or queued", accent: "linear-gradient(135deg,#00879a,#6bd8e2)" },
      { label: "Completed", value: String(completed), detail: "Consultations closed", accent: "linear-gradient(135deg,#d89812,#f7d27d)" },
      { label: "Emergency", value: String(emergency), detail: "Priority escalation", accent: "linear-gradient(135deg,#c83f3f,#f6a09e)" },
    ];
  }, [appointments]);

  const columns = [
    { key: "appointmentNumber", label: "Appointment" },
    { key: "patientId", label: "Patient ID" },
    { key: "doctorName", label: "Doctor" },
    { key: "department", label: "Department" },
    {
      key: "status",
      label: "Status",
      render: (value) => <Badge tone={value === "completed" ? "success" : value === "cancelled" || value === "missed" ? "danger" : "info"}>{value}</Badge>,
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => <Badge tone={value === "emergency" ? "danger" : value === "normal" ? "neutral" : "warning"}>{value}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              await api.post(`/appointments/${row._id}/confirm`);
              await loadAppointments();
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            Confirm
          </Button>
          <Button
            onClick={async () => {
              await api.post(`/appointments/${row._id}/check-in`, {});
              await loadAppointments();
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            Check in
          </Button>
          <Link to={`/patients/${row.patientId}`}>
            <Button size="sm" type="button" variant="ghost">Patient</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Live appointment booking, slot availability, confirmation, and check-in are now connected to the backend workflow."
        eyebrow="Appointments"
        title="Appointments"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard accent={item.accent} detail={item.detail} key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <Card>
        <CardContent className="mt-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <SearchBar className="w-full" placeholder="Search appointment, patient, doctor..." />
              <div className="mt-3">
                <Input
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Server-side search"
                  value={search}
                />
              </div>
            </div>
            <FilterBar filters={["Today", "Waiting", "Completed", "Emergency"]} />
          </div>
        </CardContent>
      </Card>

      <AppointmentForm doctors={doctors} onCreated={loadAppointments} />

      <Card>
        <CardHeader eyebrow="Operational List" title="Live appointment records" />
        <CardContent>
          <DataTable columns={columns} rows={appointments} />
        </CardContent>
      </Card>
    </div>
  );
}
