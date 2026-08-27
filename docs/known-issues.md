# Known Issues

## KNOWN-001

- Title: Formal lint scripts are not configured in package manifests
- Severity: High
- Impact: Prevents lint acceptance sign-off
- Workaround: Manual code review and build verification

## KNOWN-002

- Title: Automated unit, integration, and end-to-end test scripts are not yet exposed
- Severity: High
- Impact: Prevents full regression sign-off
- Workaround: Manual workflow review and import/build checks

## KNOWN-003

- Title: Frontend production bundle exceeds Vite warning threshold
- Severity: Medium
- Impact: Performance optimization remains incomplete
- Workaround: App is buildable and usable; route-level code splitting is recommended

## KNOWN-004

- Title: Some legacy shell placeholders remain in non-routed code paths
- Severity: Medium
- Impact: Repository cleanup is incomplete, though current user-facing routes are not broken by them
- Workaround: Keep router pointed only to live pages

## KNOWN-005

- Title: Full Docker validation was not completed in this pass
- Severity: Medium
- Impact: Deployment readiness is documented but not fully proven
- Workaround: Use local Node + MongoDB demonstration path
