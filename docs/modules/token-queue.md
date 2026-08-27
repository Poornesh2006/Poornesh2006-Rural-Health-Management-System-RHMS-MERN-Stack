# Token Queue

- Purpose: Manage live waiting workflow
- Users: Receptionist, doctor, admin
- Workflow: create token, call token, skip, escalate, start consultation
- Data model: `queue entries`
- APIs: `/queue`
- Main pages: queue page, waiting display
- Permissions: operational roles only
- Error cases: invalid transition, queue not found
- Security controls: auth and state transition checks
- Tests: manual realtime walkthrough
- Known limitations: public display privacy should remain carefully reviewed
