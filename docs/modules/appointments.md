# Appointments

- Purpose: Schedule patient-doctor visits
- Users: Receptionist, admin, doctor
- Workflow: select patient, select slot, create appointment, check in
- Data model: `appointments`, `doctor schedules`
- APIs: `/appointments`, `/doctor-schedules/slots`
- Main pages: appointments page
- Permissions: role-aware
- Error cases: missing slot, invalid patient, duplicate booking
- Security controls: validation and controlled transitions
- Tests: manual
- Known limitations: calendar visualization can be extended further
