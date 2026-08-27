# Incident Response

## Login Outage

- Detection: users cannot sign in
- Immediate action: check backend health and auth errors
- Containment: stop further risky auth changes
- Investigation: inspect env, MongoDB, token logic
- Recovery: restart backend and validate login
- Communication: inform evaluator or maintainer
- Audit evidence: log excerpts and timestamps
- Post-incident review: record root cause and fix

## Database Outage

- Detection: readiness endpoint degraded
- Immediate action: confirm MongoDB service state
- Containment: keep demo in read-only explanation mode if needed
- Investigation: connection string, service availability
- Recovery: restore DB access and verify patient lookup

## Data Inconsistency

- Detection: missing relations or invalid stock values
- Immediate action: stop risky write operations
- Investigation: run dry-run integrity scripts when available
- Recovery: apply approved repair only after review

## Queue Outage

- Detection: queue page fails or realtime stops
- Immediate action: refresh and inspect backend logs
- Recovery: restart backend and validate queue endpoints

## Notification Outage

- Detection: alerts not appearing or delivery failing
- Immediate action: inspect notification records and providers
- Recovery: use in-app or mock fallback where appropriate

## Offline Sync Conflict

- Detection: queued mutation remains unresolved
- Immediate action: preserve local draft, do not clear data
- Recovery: manual review and retry after connectivity stabilizes

## Security Incident

- Detection: suspected unauthorized access or data exposure
- Immediate action: revoke sessions, isolate environment, preserve logs
- Recovery: investigate, patch, document, and rotate secrets if needed

## Backup Failure

- Detection: backup job status failed
- Immediate action: inspect file path and permissions
- Recovery: rerun in safe environment and verify checksum

## Deployment Failure

- Detection: hosted app unreachable or health check fails
- Immediate action: rollback to previous known-good build
- Recovery: validate env and restart deployment target
