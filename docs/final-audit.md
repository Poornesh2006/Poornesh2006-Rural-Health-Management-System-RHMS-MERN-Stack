# Final audit — 1 November 2026

## Fixed high-priority findings

- CORS now uses an explicit comma-separated allowlist; disallowed browser origins are rejected.
- The dependency-status endpoint is restricted to authenticated administrators. Public liveness/readiness responses remain secret-free.
- The backend binds to `0.0.0.0` and performs graceful HTTP, scheduler, and MongoDB shutdown for Render.
- Newly registered patients receive an opaque QR-card value rather than a predictable patient ID.
- Dashboard KPI, activity, and live queue panels use backend records rather than frontend mock fallbacks.

## Remaining findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | No deployed Render/Atlas environment was available to validate public URLs. | Manual deployment required. |
| Medium | The QR image renderer remains an external image endpoint; it receives only the opaque value, but a local QR library is preferred before real-world use. | Tracked limitation. |
| Medium | Automated Playwright coverage is not configured. | Tracked limitation. |
| Low | Several scaffold pages state that a future workflow can be added. | Existing production workflows remain available on their dedicated pages. |

This is an academic/demo healthcare application. No regulatory-compliance claim is made.
