# Release Candidate

## Candidate

- Version: `v1.0.0-rc.1`
- Date: `August 5, 2026`
- Status: `Prepared for review, not final sign-off`

## Verified In This Repository

- Frontend production build succeeded
- Backend import verification succeeded

## Blocking Gaps Before Final `v1.0.0`

- No backend lint script available
- No frontend lint script available
- No backend unit test script available
- No frontend unit test script available
- No end-to-end script available
- No Docker build verification completed in this pass

## Release Checklist

- [x] Release notes updated
- [x] Version updated to release candidate
- [x] Known issues documented
- [x] UAT plan documented
- [x] Handover guide prepared
- [ ] Lint verified
- [ ] Automated tests verified
- [ ] Docker verified
- [ ] Full UAT walkthrough evidence captured
- [ ] Final reviewer sign-off completed

## Migration Checklist

- Confirm environment variables
- Confirm MongoDB connectivity
- Confirm seeded users and demo mode behavior
- Confirm active facility defaults
- Rebuild frontend before deployment

## Rollback Checklist

- Revert to previous tagged build
- Restore previous frontend bundle
- Restart backend with previous version
- Confirm health endpoints and login
