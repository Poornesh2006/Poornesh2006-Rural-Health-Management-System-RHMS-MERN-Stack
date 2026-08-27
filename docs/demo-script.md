# Demo Script

## 10-15 Minute Demo

### Opening

- Action: Open `/presentation`
- Say: "This is our Rural Health Management System built for rural primary healthcare workflows with offline support, multilingual UI, analytics, referrals, and safe AI review."
- Expected result: Presentation dashboard hero and demo shortcuts visible
- Backup: If routing fails, open the main dashboard and explain the modules from navigation

### Login

- Action: Open `/login` and sign in with demo admin or role account
- Say: "The system uses role-based access control with authenticated sessions."
- Expected result: Dashboard loads
- Backup: Use already logged-in session

### Dashboard

- Action: Show summary cards and quick actions
- Say: "The dashboard gives a live operational overview across registration, queue, notifications, and analytics."
- Expected result: Summary metrics and linked modules visible
- Backup: Refresh page if cards did not load

### Patient Registration

- Action: Go to patient registration and create a fictional patient
- Say: "Reception can register a patient, generate an ID, and store initial health details."
- Expected result: Patient profile or saved state
- Backup: Use an existing demo patient profile if create fails

### Appointment And Queue

- Action: Book or open appointment workflow, then open queue
- Say: "Appointments link to a token queue so the patient journey moves from booking to live waiting management."
- Expected result: Appointment list and queue sections visible
- Backup: Open an existing queued record

### Consultation

- Action: Open doctor dashboard and demonstrate consultation form
- Say: "Doctors can review history, record vitals, add diagnosis, create prescriptions, request lab tests, and schedule follow-ups."
- Expected result: Consultation UI visible
- Backup: Open patient profile timeline and explain completed records

### Pharmacy

- Action: Open pharmacy page
- Say: "Pharmacy workflows show prescriptions, batch-level stock, and dispensing records."
- Expected result: Inventory and dispensing workflows visible
- Backup: Explain with low-stock and prescription data already loaded

### Laboratory

- Action: Open laboratory page
- Say: "Lab requests move through collection, processing, result entry, and verification."
- Expected result: Pending and verified request examples visible
- Backup: Use timeline or analytics indicators if request actions are unavailable

### Vaccination

- Action: Open vaccination page
- Say: "Health workers can view due lists, record doses, update stock, and issue certificates."
- Expected result: Vaccination records and batch list visible
- Backup: Use a patient timeline example

### Analytics

- Action: Open analytics or reports
- Say: "Administrators can review operational metrics and export report outputs."
- Expected result: Analytics widgets and report controls
- Backup: Show presentation dashboard stats if analytics query is slow

### Offline Mode

- Action: Point to connectivity indicator and explain queued sync flow
- Say: "The system supports offline draft capture and resynchronization for weak-connectivity environments."
- Expected result: Connectivity badge visible
- Backup: Refer to documentation and screenshot guide

### Security And AI Safety

- Action: Open AI governance page
- Say: "AI is assistance only. It cannot auto-save clinical content and requires human review with audit logging."
- Expected result: Disclaimer and review actions visible
- Backup: Use governance documentation if API data is not available

### Conclusion

- Action: Return to presentation dashboard
- Say: "RHMS demonstrates an integrated rural-health workflow platform with real operational breadth, offline readiness, multilingual support, and safe extensibility."
- Expected result: Clean closing screen
- Backup: Close with project report or README overview

## 5-Minute Emergency Demo

1. Open dashboard and explain the objective
2. Open patient registration
3. Open queue page
4. Open doctor consultation page
5. Open analytics page
6. Conclude with AI governance or presentation page
