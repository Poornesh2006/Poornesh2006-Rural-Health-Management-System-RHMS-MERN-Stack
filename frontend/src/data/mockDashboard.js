export const metrics = [
  {
    label: "Today's Patients",
    value: "184",
    detail: "+12% vs last week",
    accent: "linear-gradient(135deg, #2E7D32 0%, #6bd388 100%)",
  },
  {
    label: "Appointments Live",
    value: "46",
    detail: "11 waiting for consultation",
    accent: "linear-gradient(135deg, #00879a 0%, #6bd8e2 100%)",
  },
  {
    label: "Vaccinations Due",
    value: "29",
    detail: "7 high-priority reminders",
    accent: "linear-gradient(135deg, #d89812 0%, #f7d27d 100%)",
  },
  {
    label: "Low Stock Alerts",
    value: "08",
    detail: "3 critical medicines",
    accent: "linear-gradient(135deg, #c83f3f 0%, #f6a09e 100%)",
  },
];

export const queueItems = [
  { token: "A-014", name: "Meena K", reason: "Antenatal review", status: "Priority" },
  { token: "A-015", name: "Ravi M", reason: "Diabetes follow-up", status: "Waiting" },
  { token: "E-002", name: "Selvam P", reason: "Emergency fever", status: "Emergency" },
];

export const activities = [
  { time: "09:12", title: "New patient registered", note: "RPHC-PAT-2026-000184 created at reception" },
  { time: "09:28", title: "Lab report uploaded", note: "CBC report attached for Anitha R" },
  { time: "09:41", title: "Medicine stock warning", note: "Paracetamol syrup below reorder threshold" },
];

export const quickActions = [
  "Register patient",
  "Create appointment",
  "Generate token",
  "Open doctor queue",
];

export const queuePerformance = [
  { id: "q1", service: "Reception Check-in", average: "4 min", throughput: "34 patients" },
  { id: "q2", service: "Doctor Consultation", average: "11 min", throughput: "28 patients" },
  { id: "q3", service: "Pharmacy Dispatch", average: "6 min", throughput: "25 patients" },
];
