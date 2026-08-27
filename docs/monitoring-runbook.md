# Monitoring Runbook

## API Uptime Check

- Meaning: Backend process availability
- Severity: High
- Investigation: Check `/health/live` and process logs
- Recovery: Restart backend, confirm MongoDB connection
- Escalation: Project maintainer
- Verification: Endpoint exists

## Database Health

- Meaning: MongoDB readiness or connectivity issue
- Severity: High
- Investigation: Check `/health/ready`
- Recovery: Restore MongoDB access and restart if needed

## Socket.IO Connection Health

- Meaning: Realtime queue updates degraded
- Severity: Medium
- Investigation: Check queue page behavior and backend startup logs
- Recovery: Restart backend and reconnect frontend clients

## Notification Failure Alert

- Meaning: Delivery or dispatch failure
- Severity: Medium
- Investigation: Review notification records and logs
- Recovery: Retry safe channels and confirm provider configuration

## High Latency Alert

- Meaning: Slow API or export response
- Severity: Medium
- Investigation: Check reports, analytics, and database load
- Recovery: Reduce heavy queries and review indexes

## Backup Failure Alert

- Meaning: Backup job failed or restore request blocked
- Severity: High
- Investigation: Review backup job status and file path access
- Recovery: Re-run on safe environment and verify checksum
