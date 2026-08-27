# AI Assistance

- Purpose: Review-only support for summary drafts and duplicate detection
- Users: Authorized staff and doctors
- Workflow: generate draft, review, accept or reject, audit outcome
- Data model: `aiaudits`
- APIs: `/platform/ai/visit-summary`, `/platform/ai/duplicates`, `/platform/ai/reviews/:auditId`
- Main pages: AI governance page
- Permissions: authorized users
- Error cases: missing patient, audit not found
- Security controls: disclaimer, redaction, no auto-save
- Tests: backend import verification and UI integration
- Known limitations: provider integration is still mock/review-oriented
