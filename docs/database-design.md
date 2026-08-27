# Database Design

## Data Modeling Goals

- preserve complete patient history
- avoid destructive mutation of clinical records
- support analytics queries with targeted indexes
- keep patient identity and visit events normalized

## Primary Collections

### `users`

- `_id`
- `fullName`
- `email`
- `phone`
- `passwordHash`
- `role`
- `isActive`
- `lastLoginAt`
- `loginHistory`
- `refreshTokens`
- `resetPasswordTokenHash`
- `resetPasswordExpiresAt`
- `createdAt`
- `updatedAt`

Indexes:

- unique `email`
- unique `phone`
- `role`

### `patients`

- `_id`
- `patientId`
- `qrCodeValue`
- `photoUrl`
- `firstName`
- `lastName`
- `fullName`
- `dateOfBirth`
- `age`
- `gender`
- `bloodGroup`
- `phone`
- `email`
- `aadhaarNumber`
- `address`
- `guardianName`
- `emergencyContact`
- `occupation`
- `insurance`
- `disabilityDetails`
- `disability`
- `medicalFlags`
- `vitals`
- `documents`
- `status`
- `createdBy`
- `updatedBy`
- `archivedAt`
- `deletedAt`
- `createdAt`
- `updatedAt`

Indexes:

- unique `patientId`
- unique sparse `aadhaarNumber`
- `phone`
- `fullName`
- `address.village`
- compound `fullName + phone`

### `visits`

- `_id`
- `visitId`
- `patientId`
- `doctorId`
- `appointmentId`
- `tokenNumber`
- `visitType`
- `symptoms`
- `diagnosis`
- `vitals`
- `prescriptionItems`
- `labOrders`
- `notes`
- `followUpDate`
- `attachments`
- `createdAt`
- `updatedAt`

Indexes:

- unique `visitId`
- `patientId`
- `doctorId`
- `createdAt`
- compound `patientId + createdAt`

### `appointments`

- `_id`
- `appointmentId`
- `patientId`
- `doctorId`
- `scheduledAt`
- `status`
- `priority`
- `channel`
- `reason`
- `checkInAt`
- `createdAt`
- `updatedAt`

### `tokens`

- `_id`
- `tokenId`
- `appointmentId`
- `patientId`
- `queueDate`
- `number`
- `priority`
- `status`
- `counter`
- `servedAt`

### `medicines`

- `_id`
- `sku`
- `name`
- `genericName`
- `batchNumber`
- `expiryDate`
- `supplier`
- `quantityInStock`
- `reorderLevel`
- `unit`

### `labReports`

- `_id`
- `reportId`
- `patientId`
- `visitId`
- `requestedBy`
- `testType`
- `status`
- `resultSummary`
- `fileUrl`

### `vaccinations`

- `_id`
- `patientId`
- `vaccineName`
- `doseNumber`
- `scheduledDate`
- `administeredDate`
- `status`

### `auditLogs`

- `_id`
- `actorId`
- `actorRole`
- `action`
- `resourceType`
- `resourceId`
- `metadata`
- `ipAddress`
- `createdAt`

## Relationship Notes

- one patient to many visits
- one patient to many appointments
- one appointment to zero or one token
- one visit to many lab reports
- one patient to many vaccinations

## Identifier Strategy

- `patientId`: `RPHC-PAT-YYYY-######`
- `visitId`: `VIS-YYYYMMDD-######`
- `appointmentId`: `APT-YYYYMMDD-######`
- `tokenId`: `TOK-YYYYMMDD-###`

## Retention Policy

- visits are append-only from a business perspective
- patient archival is soft-delete only
- audit logs are immutable
