# Bug Triage

## Severity Model

- Severity 1: Critical outage, data loss, unauthorized access, or privacy breach
- Severity 2: Major workflow failure
- Severity 3: Medium workflow inconsistency or layout issue
- Severity 4: Cosmetic or non-blocking issue

## Recorded Issues

### BUG-001

- Title: Frontend startup failed due to missing i18n dependencies
- Module: Frontend boot
- Severity: 2
- Environment: Local development
- Steps to reproduce: Start frontend after i18n code was added
- Expected result: Vite resolves all imports
- Actual result: `i18next` and `react-i18next` could not be resolved
- Root cause: Dependencies were used but not declared in `frontend/package.json`
- Fix: Added missing dependencies to frontend manifest
- Files changed: `frontend/package.json`
- Test added: Not available
- Verification status: Verified by successful frontend build
- Remaining risk: Fresh install must still succeed on evaluator machine

### BUG-002

- Title: Backend notification template seeding failed on duplicate template code
- Module: Backend startup
- Severity: 2
- Environment: Local development
- Steps to reproduce: Start backend after multi-language notification template expansion
- Expected result: Backend seeds templates and starts
- Actual result: Duplicate key error on `templateCode`
- Root cause: Old unique index conflicted with language and channel variants
- Fix: Removed the redundant single-field template index from the schema and dropped any legacy unique `templateCode_1` index during seed
- Files changed: notification template model, seed service
- Test added: Not available
- Verification status: Verified by seed-path review and backend import success
- Remaining risk: Existing databases should be monitored on first restart

### BUG-003

- Title: Existing users failed login after session-aware auth schema change
- Module: Authentication
- Severity: 2
- Environment: Local development with pre-existing data
- Steps to reproduce: Log in using older users after adding `sessionId`
- Expected result: Existing users remain compatible
- Actual result: Validation error on legacy refresh-token entries
- Root cause: Backward compatibility gap in refresh-token schema
- Fix: Relaxed legacy `sessionId` requirement
- Files changed: user model
- Test added: Not available
- Verification status: Verified through subsequent login path stability
- Remaining risk: Future migration cleanup is still recommended

### BUG-004

- Title: Dashboard still showed mock doctor and notification data
- Module: Dashboard
- Severity: 3
- Environment: Local development
- Steps to reproduce: Open dashboard after later phases
- Expected result: Dashboard widgets use live summary data
- Actual result: Two panels still imported mock arrays
- Root cause: Earlier shell widgets were not reconnected
- Fix: Extended dashboard summary API and updated widgets
- Files changed: dashboard service and dashboard widgets
- Test added: Not available
- Verification status: Verified by build and import checks
- Remaining risk: Summary quality depends on seeded operational data
