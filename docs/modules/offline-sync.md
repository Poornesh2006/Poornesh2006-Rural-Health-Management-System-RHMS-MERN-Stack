# Offline Sync

- Purpose: Support unstable rural connectivity
- Users: All operational roles
- Workflow: save drafts locally, queue pending mutations, reconnect and sync
- Data model: IndexedDB stores in frontend
- APIs: existing business APIs plus queued replay
- Main pages: registration, appointments, queue, settings
- Permissions: per logged-in session and cleared on logout
- Error cases: conflict or replay failure
- Security controls: local data clearing and no token storage in IndexedDB
- Tests: partial manual walkthrough
- Known limitations: full conflict-resolution UI remains limited
