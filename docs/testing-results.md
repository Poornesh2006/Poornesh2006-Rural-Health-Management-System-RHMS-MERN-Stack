# Testing results

Executed locally on 1 November 2026:

- `npm.cmd run seed:demo` — passed.
- `npm.cmd run seed:demo:verify` — passed: facilities 3, staff 21, patients 250, households 75, visits 500, appointments 120, queue 80, prescriptions 180, lab requests 120, lab results 90, vaccinations 180, follow-ups 100, notifications 100, audit logs 300.
- JavaScript syntax checks for the demo seed and verification scripts — passed.
- API startup and `GET /health` smoke test — passed with HTTP 200.

Not executed: Playwright/browser E2E, Atlas integration, Render deployment smoke test, and dependency vulnerability audit. These need an isolated deployed/test environment.
