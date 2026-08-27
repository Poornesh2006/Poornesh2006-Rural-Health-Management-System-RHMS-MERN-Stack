# Security

- Purpose: Protect patient and operational data
- Users: All
- Workflow: auth, authorization, validation, session controls, health checks, logging
- Data model: users, sessions, audits, notifications
- APIs: auth, health, platform, and secured business routes
- Main pages: login, settings, AI governance
- Permissions: enforced server-side
- Error cases: unauthorized, forbidden, validation failures
- Security controls: JWT, bcrypt, RBAC, structured logging, rate-limit foundations, audit logging
- Tests: manual review and partial verification only
- Known limitations: no full automated security test suite exposed
