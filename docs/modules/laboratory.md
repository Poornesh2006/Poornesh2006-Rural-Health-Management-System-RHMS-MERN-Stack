# Laboratory

- Purpose: Request-to-report workflow for tests
- Users: Lab technician, doctor, admin
- Workflow: acknowledge request, collect sample, process, enter result, verify
- Data model: `lab requests`, `lab samples`, `lab results`
- APIs: laboratory endpoints
- Main pages: laboratory page
- Permissions: lab role and authorized reviewers
- Error cases: invalid state transitions, missing request
- Security controls: verified reports treated as sensitive workflow states
- Tests: manual flow
- Known limitations: print report polish can still improve
