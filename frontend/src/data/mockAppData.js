export const patientRows = [
  {
    id: "RPHC-PAT-2026-000184",
    name: "Meena K",
    gender: "Female",
    age: 29,
    village: "Melaur",
    phone: "9876543210",
    status: "Active",
    risk: "High",
    lastVisit: "Jul 30, 2026",
  },
  {
    id: "RPHC-PAT-2026-000173",
    name: "Ravi M",
    gender: "Male",
    age: 56,
    village: "Thandalam",
    phone: "9865123478",
    status: "Follow-up",
    risk: "Moderate",
    lastVisit: "Aug 2, 2026",
  },
  {
    id: "RPHC-PAT-2026-000162",
    name: "Anitha R",
    gender: "Female",
    age: 34,
    village: "Keerapakkam",
    phone: "9784512365",
    status: "Active",
    risk: "Low",
    lastVisit: "Aug 4, 2026",
  },
  {
    id: "RPHC-PAT-2026-000150",
    name: "Selvam P",
    gender: "Male",
    age: 43,
    village: "Melaur",
    phone: "9876123401",
    status: "Archived",
    risk: "Moderate",
    lastVisit: "Jul 21, 2026",
  },
];

export const patientTimeline = [
  { time: "Aug 4, 2026", title: "Diabetes review completed", note: "Fasting sugar stabilized, follow-up after 21 days." },
  { time: "Jul 30, 2026", title: "CBC report attached", note: "Lab report reviewed by Dr. Praveen." },
  { time: "Jul 18, 2026", title: "Antenatal consultation", note: "Routine vitals and nutrition guidance recorded." },
];

export const appointmentSummary = [
  { label: "Upcoming", value: "32", detail: "9 within 2 hours", accent: "linear-gradient(135deg,#0c879d,#5be0ee)" },
  { label: "Completed", value: "118", detail: "86% fulfilment", accent: "linear-gradient(135deg,#1f6e2c,#7be48b)" },
  { label: "Cancelled", value: "07", detail: "Mostly weather-related", accent: "linear-gradient(135deg,#e39d17,#f4d577)" },
];

export const queueColumns = [
  { token: "Q-042", patient: "Kumar S", status: "Waiting", desk: "General OP", priority: "Normal" },
  { token: "Q-043", patient: "Anitha R", status: "Current", desk: "Doctor Room 2", priority: "Priority" },
  { token: "E-004", patient: "Muthu V", status: "Emergency", desk: "Emergency Bay", priority: "Critical" },
];

export const doctorAvailability = [
  { id: "doc-1", name: "Dr. Priya N", specialty: "General Medicine", availability: "Available now" },
  { id: "doc-2", name: "Dr. Praveen S", specialty: "Public Health", availability: "Consulting until 1:30 PM" },
  { id: "doc-3", name: "Dr. Lavanya K", specialty: "Women and Child Health", availability: "Follow-up clinic" },
];

export const medicineInventory = [
  { name: "Paracetamol 650 mg", stock: "122 strips", state: "Low Stock", expiry: "Nov 2026" },
  { name: "Iron Folic Acid", stock: "612 tablets", state: "Healthy", expiry: "Jan 2027" },
  { name: "ORS Sachet", stock: "188 units", state: "Healthy", expiry: "Sep 2026" },
];

export const labCards = [
  { label: "Pending Reports", value: "18", detail: "5 urgent review flags" },
  { label: "Completed Today", value: "26", detail: "92% within target SLA" },
  { label: "Upload Queue", value: "09", detail: "Awaiting technician upload" },
];

export const reportCategories = [
  "Patient Reports",
  "Doctor Reports",
  "Medicine Reports",
  "Village Reports",
  "Vaccination Reports",
  "Appointment Reports",
];

export const notificationItems = [
  { id: "n1", title: "Follow-up reminders scheduled", description: "18 SMS reminders queued for tomorrow morning.", tone: "info" },
  { id: "n2", title: "Low stock escalation", description: "Paracetamol syrup stock moved below emergency threshold.", tone: "warning" },
  { id: "n3", title: "Doctor room reassigned", description: "Room 3 assigned to immunization support until 2 PM.", tone: "success" },
];

export const settingsSections = [
  "Profile",
  "Hospital Information",
  "Theme",
  "Language",
  "Security",
  "Notifications",
  "Backup",
  "About",
];

export const faqItems = [
  { q: "How do I register a patient quickly?", a: "Use the Register Patient page or the quick action card from the dashboard." },
  { q: "Can I use this offline?", a: "Offline workflows are planned for a later implementation phase." },
  { q: "Where do reports appear?", a: "Reports and analytics each have dedicated pages in the left navigation." },
];
