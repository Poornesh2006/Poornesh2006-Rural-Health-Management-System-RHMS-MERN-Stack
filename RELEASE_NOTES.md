# Release Notes

## RHMS v1.0.0-rc.1

### Highlights

- End-to-end Rural Health Management System academic demonstration platform
- Role-aware patient, appointment, queue, consultation, pharmacy, laboratory, vaccination, and analytics workflows
- Offline-first PWA support with queued synchronization
- English and Tamil interface support
- Multi-PHC platform foundations, referrals, consents, outreach, and devices
- Safe AI review-only assistance with governance records

### Security Features

- JWT and refresh-token workflow
- RBAC and session revocation
- Health endpoints and structured logging
- Privacy-aware data export and tenant-aware foundations

### Known Limitations

- Lint and formal automated test scripts are not yet exposed in package scripts
- Guided tours and one-click demo reset UI are not fully implemented
- Full Docker verification was not completed in this pass
- Some legacy modules still need deeper tenant enforcement refinement

### Release Recommendation

- Keep this build as a release candidate until lint, automated tests, Docker validation, and fuller UAT evidence are available.

### Future Scope

- Production deployment hardening
- Rich demo dataset and guided tours
- More complete FHIR and integration coverage
- Automated CI test suite and Docker workflows
