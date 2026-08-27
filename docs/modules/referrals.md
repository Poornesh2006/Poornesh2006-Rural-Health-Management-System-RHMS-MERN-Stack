# Referrals

- Purpose: Consent-controlled inter-facility sharing and routing
- Users: Doctor, admin, authorized staff
- Workflow: capture consent, create referral, send, accept, download PDF
- Data model: `consents`, `referrals`
- APIs: `/platform/consents`, `/platform/referrals`
- Main pages: referrals page
- Permissions: authorized users only
- Error cases: missing consent, not found, invalid destination
- Security controls: consent checks before referral sharing
- Tests: backend import verification and UI flow
- Known limitations: richer destination selection UX can improve
