# Release checklist

- [x] Demo data verified in a non-production database.
- [x] API liveness and readiness routes implemented.
- [x] CORS allowlist and secure headers configured.
- [x] Render Blueprint and environment templates added.
- [ ] Configure Atlas network access and production secrets.
- [ ] Deploy API and validate `/health/ready`.
- [ ] Deploy frontend with final `VITE_API_URL`.
- [ ] Execute public smoke tests with synthetic accounts.
- [ ] Add local QR rendering and Playwright E2E coverage before any non-demo rollout.
