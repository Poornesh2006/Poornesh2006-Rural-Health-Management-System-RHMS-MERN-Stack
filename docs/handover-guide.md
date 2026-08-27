# Handover Guide

## Project Overview

RHMS is a MERN-based academic rural healthcare workflow platform with patient, queue, clinical, pharmacy, lab, vaccination, analytics, offline, referral, and AI-review foundations.

## Repository Structure

- `backend`
- `frontend`
- `docs`
- `submission`

## Environments

- Local development
- Future staging or production environments as configured by deployer

## Deployment Locations

- Placeholder: add final frontend and backend URLs when real deployment succeeds

## Environment Variables

See `docs/installation-guide.md`.

## Database Access Procedure

- Use configured MongoDB URI
- Do not share production credentials in documentation

## Backup Process

- Use admin-controlled backup flow
- Verify storage path and checksum

## Restore Process

- Use restore request safeguard
- Always create pre-restore backup first

## User Creation And Role Management

- Admin creates users through protected routes or seeded/demo setup
- Facility scope should be reviewed before assignment

## Monitoring And Logs

- Use health endpoints and backend logs
- Review notification and backup failures regularly

## Common Incidents

- Login issue
- Backend unavailable
- Queue realtime issue
- Offline sync conflict

## Release Procedure

- Update docs
- Run available builds
- Confirm known issues
- Update release notes

## Rollback Procedure

- Revert to previous tagged build and restart backend/frontend

## Demo Reset

- Development-only concept documented; full reset endpoint still requires controlled implementation

## Known Limitations

- Formal lint/test automation not yet available in package scripts
- Full Docker verification incomplete

## Maintenance Contact Placeholders

- Technical owner: placeholder
- Deployment owner: placeholder
- Faculty reviewer: placeholder
