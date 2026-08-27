# API Reference

Base URL: `http://localhost:5000/api/v1`

## Authentication

### POST `/auth/login`

- Purpose: Sign in and receive access and refresh tokens
- Required role: public
- Request body: `email`, `password`
- Success: access token, refresh token, user
- Errors: `401`, validation failure

### GET `/auth/profile`

- Purpose: Load authenticated profile
- Required role: authenticated user
- Success: user profile and tenant context

### GET `/auth/sessions`

- Purpose: List active sessions
- Required role: authenticated user

## Users

### GET `/users`

- Purpose: List users within current tenant scope
- Required role: admin

### POST `/users`

- Purpose: Create user
- Required role: admin

## Patients

### GET `/patients`

- Purpose: Search and list patients
- Required role: authenticated user
- Query: `search`, `status`, `gender`, `village`, `page`, `limit`

### POST `/patients`

- Purpose: Create patient
- Required role: authenticated user

### GET `/patients/:patientId`

- Purpose: Load patient details
- Required role: authenticated user

### GET `/patients/:patientId/clinical-profile`

- Purpose: Load patient timeline with prescriptions, lab, and vaccination history
- Required role: authenticated user

## Appointments

### GET `/appointments`

- Purpose: List appointments
- Required role: authenticated user

### POST `/appointments`

- Purpose: Create appointment
- Required role: authenticated user

## Queue

### GET `/queue`

- Purpose: Load current queue state
- Required role: authenticated user

### POST `/queue/:queueId/status`

- Purpose: Update queue status
- Required role: role-based operational user

## Consultations

### POST `/consultations/start`

- Purpose: Start consultation from queue entry
- Required role: doctor

### POST `/consultations/complete`

- Purpose: Complete consultation
- Required role: doctor

## Pharmacy

### GET `/pharmacy/prescriptions`

- Purpose: Load pending prescriptions
- Required role: pharmacist or admin

### POST `/pharmacy/prescriptions/:id/dispense`

- Purpose: Dispense prescribed items
- Required role: pharmacist or admin

## Laboratory

### GET `/laboratory/requests`

- Purpose: Load lab requests
- Required role: lab technician, doctor, admin

### POST `/laboratory/requests/:id/verify`

- Purpose: Verify lab report
- Required role: lab technician or admin

## Vaccination

### GET `/vaccination/records`

- Purpose: Load vaccination records and due workflows
- Required role: health worker or admin

### POST `/vaccination/record`

- Purpose: Record administered vaccine
- Required role: health worker or admin

## Reports

### GET `/reports/preview`

- Purpose: Preview report output
- Required role: authorized staff

### GET `/reports/export`

- Purpose: Export CSV, PDF, or Excel
- Required role: authorized staff

## Analytics

### GET `/analytics/executive`

- Purpose: Executive metrics
- Required role: admin

### GET `/analytics/village-health`

- Purpose: Village-level aggregate analytics
- Required role: admin or authorized staff

## Notifications

### GET `/notifications`

- Purpose: Load in-app notifications
- Required role: authenticated user

### PATCH `/notifications/:notificationId/read`

- Purpose: Mark notification as read
- Required role: authenticated user

### PUT `/notifications/preferences/me`

- Purpose: Update notification preferences
- Required role: authenticated user

## Platform

### GET `/platform/context`

- Purpose: Load organizations, facilities, allowed facilities, and feature flags
- Required role: authenticated user

### POST `/platform/switch-facility`

- Purpose: Switch active facility
- Required role: authenticated user with allowed facility membership

### GET `/platform/consents`

- Purpose: List consent records
- Required role: authenticated user

### POST `/platform/consents`

- Purpose: Create consent
- Required role: authenticated user

### GET `/platform/referrals`

- Purpose: List referrals
- Required role: authenticated user

### POST `/platform/referrals`

- Purpose: Create referral
- Required role: authenticated user

### GET `/platform/referrals/:referralId/pdf`

- Purpose: Download referral PDF
- Required role: authorized staff

### GET `/platform/fhir/export`

- Purpose: Export FHIR-style bundle
- Required role: authorized staff
- Query: `patientId`, `resourceTypes`

### POST `/platform/ai/visit-summary`

- Purpose: Generate review-only visit summary
- Required role: authorized staff

### GET `/platform/ai/duplicates`

- Purpose: Generate duplicate detection candidates
- Required role: authorized staff

### POST `/platform/ai/reviews/:auditId`

- Purpose: Accept, edit, or reject AI output
- Required role: authorized staff

### GET `/platform/devices`

- Purpose: List registered devices
- Required role: authenticated user

### POST `/platform/devices`

- Purpose: Register device
- Required role: authenticated user

### GET `/platform/outreach-camps`

- Purpose: List outreach camps
- Required role: authenticated user

### POST `/platform/outreach-camps`

- Purpose: Create outreach camp
- Required role: authenticated user

## Health Checks

### GET `/health`

- Purpose: Basic liveness

### GET `/health/live`

- Purpose: Liveness endpoint

### GET `/health/ready`

- Purpose: Readiness endpoint

### GET `/health/dependencies`

- Purpose: Dependency status

## Validation And Rate Limits

- Validation is handled with Zod and Mongoose constraints
- Lightweight rate-limit middleware exists for sensitive routes, though not every route is fully documented with exact limits in the current codebase

## Development API Collection

See [docs/rhms-postman-collection.json](rhms-postman-collection.json).
