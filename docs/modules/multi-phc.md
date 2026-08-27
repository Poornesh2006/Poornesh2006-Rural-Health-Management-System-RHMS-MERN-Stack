# Multi-PHC

- Purpose: Platform foundations for organizations and facilities
- Users: Admin and cross-facility authorized staff
- Workflow: load context, switch facility, apply tenant boundaries
- Data model: `organizations`, `facilities`, tenant fields on major records
- APIs: `/platform/context`, `/platform/switch-facility`
- Main pages: platform page, facility switcher
- Permissions: authenticated with allowed facility membership
- Error cases: forbidden switch, missing facility
- Security controls: backend tenant middleware
- Tests: backend import verification and basic UI integration
- Known limitations: not every legacy module is fully tenant-scoped yet
