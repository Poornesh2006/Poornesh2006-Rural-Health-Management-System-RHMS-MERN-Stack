# Vaccination

- Purpose: Due tracking, stock, and administered-dose recording
- Users: Health worker, admin
- Workflow: view due list, select patient, administer dose, update stock, issue certificate
- Data model: `vaccines`, `vaccine batches`, `vaccination schedules`, `vaccination records`
- APIs: vaccination endpoints
- Main pages: vaccination page
- Permissions: health worker and admin
- Error cases: duplicate recording, stock issue
- Security controls: transaction-aware service logic
- Tests: manual flow
- Known limitations: broader outreach integration can be extended
