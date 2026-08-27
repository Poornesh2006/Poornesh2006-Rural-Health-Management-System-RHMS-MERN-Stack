# Authentication

- Purpose: Secure login, refresh-token flow, session management
- Users: All authenticated roles
- Workflow: Login, load profile, maintain session, revoke sessions
- Data model: `users`
- APIs: `/auth/login`, `/auth/profile`, `/auth/refresh`, `/auth/sessions`
- Main pages: login, settings
- Permissions: authenticated session required
- Error cases: invalid credentials, expired token
- Security controls: bcrypt, JWT, session revocation
- Tests: manual verification and backend imports
- Known limitations: formal auth test suite not exposed in package scripts
