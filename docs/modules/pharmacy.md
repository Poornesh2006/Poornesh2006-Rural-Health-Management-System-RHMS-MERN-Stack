# Pharmacy

- Purpose: Inventory and dispensing operations
- Users: Pharmacist, admin
- Workflow: open pending prescription, choose batch, dispense, reduce stock
- Data model: `medicines`, `medicine batches`, `prescriptions`, `dispensing records`
- APIs: pharmacy endpoints
- Main pages: pharmacy page
- Permissions: pharmacist and admin
- Error cases: insufficient stock, invalid batch
- Security controls: service-side update logic and audit relevance
- Tests: manual flow
- Known limitations: advanced FEFO tooling can be expanded
