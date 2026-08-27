# Consultation

- Purpose: Record clinical encounter details
- Users: Doctor
- Workflow: review history, add vitals, complaint, diagnosis, prescription, lab request, follow-up
- Data model: `visits`
- APIs: consultation endpoints
- Main pages: doctor dashboard
- Permissions: doctor-focused
- Error cases: missing queue entry, invalid completion state
- Security controls: review-only AI assistance, record validation
- Tests: manual workflow
- Known limitations: rich note templates can be expanded
