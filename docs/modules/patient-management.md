# Patient Management

- Purpose: Register, search, update, archive, and review patient history
- Users: Receptionist, doctor, admin, health worker
- Workflow: Intake, patient ID generation, profile review, timeline access
- Data model: `patients`, `visits`
- APIs: `/patients`, `/patients/:id`, `/patients/:id/clinical-profile`
- Main pages: patient registration, list, details
- Permissions: authenticated role-based access
- Error cases: duplicate identifiers, not found, validation errors
- Security controls: auth, validation, tenant-ready scoping
- Tests: manual and build verification
- Known limitations: full duplicate-merge UI not completed
