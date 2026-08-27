# Database Dictionary

## patients

- Purpose: Stores demographic and operational patient identity details
- Important fields: `patientId`, `fullName`, `phone`, `address`, `medicalFlags`, `facilityRef`
- Required fields: `patientId`, `qrCodeValue`, `firstName`, `lastName`, `fullName`, `gender`, `phone`, `createdBy`
- Relationships: visits, appointments, consents, referrals, vaccination records
- Indexes: `patientId`, `phone`, `createdAt`, text index
- Unique constraints: `patientId`, sparse `aadhaarNumber`
- Status enums: `active`, `archived`, `inactive`
- Soft delete: `deletedAt`
- Tenant scope: organization and facility references
- Audit behavior: create/update/archive tracked through audit service

## users

- Purpose: Stores staff and admin accounts
- Important fields: `email`, `role`, `organizationRef`, `primaryFacilityRef`, `allowedFacilities`, `activeSessions`
- Required fields: `fullName`, `email`, `passwordHash`, `role`
- Relationships: appointments, visits, notifications, sessions
- Indexes: `email`, `role`, text index
- Unique constraints: `email`
- Status enums: role enum plus `isActive`
- Soft delete: no soft delete, direct removal in current workflow
- Tenant scope: organization and facility references
- Audit behavior: account actions should be admin-controlled

## appointments

- Purpose: Schedules patient-doctor interactions
- Important fields: `appointmentNumber`, `patientId`, `doctorRef`, `appointmentDate`, `status`, `facilityRef`
- Required fields: `appointmentNumber`, `patientRef`, `patientId`, `department`, `appointmentDate`, `startTime`, `endTime`, `reason`
- Relationships: patients, users, queue entries, visits
- Indexes: `appointmentNumber`, doctor/date/slot, patient/date, facility/date/status
- Unique constraints: `appointmentNumber`
- Status enums: scheduled lifecycle values
- Soft delete: `isArchived`
- Tenant scope: organization and facility references
- Audit behavior: transitions should be logged through service workflows

## visits

- Purpose: Stores consultation notes and clinical encounter details
- Important fields: `visitId`, `patientId`, `doctorRef`, `complaint`, `diagnosis`, `visitStatus`, `facilityRef`
- Required fields: `visitId`, `patientId`, `patientRef`
- Relationships: patients, users, appointments, queue entries
- Indexes: `visitId`, patient/date, facility/date
- Unique constraints: `visitId`
- Status enums: `draft`, `in_progress`, `completed`, `follow_up_due`, `cancelled`
- Soft delete: none in current schema
- Tenant scope: organization and facility references
- Audit behavior: consultation completion is operationally significant

## notifications

- Purpose: Central notification records
- Important fields: `notificationNumber`, `recipientUser`, `recipientRole`, `category`, `status`, `channels`
- Required fields: `notificationNumber`, `title`, `message`
- Relationships: users, patients
- Indexes: number, recipient, status, scheduled time
- Unique constraints: `notificationNumber`
- Status enums: queued, sent, delivered, read, failed, cancelled
- Soft delete: none
- Tenant scope: indirect through recipients and related records
- Audit behavior: delivery and read state are operationally tracked

## notificationpreferences

- Purpose: User notification channel preferences
- Important fields: `user`, channel toggles, reminder toggles, `preferredLanguage`
- Required fields: none beyond generated user link
- Relationships: users
- Indexes: sparse unique `user`
- Unique constraints: one preference record per user
- Status enums: boolean toggles
- Soft delete: none
- Tenant scope: user-bound
- Audit behavior: preference changes should be admin or user-controlled

## prescriptions

- Purpose: Tracks medicines prescribed from consultations
- Important fields: `prescriptionNumber`, `patientId`, `status`, `items`
- Required fields: implementation-dependent in current model
- Relationships: patients, visits, dispensing records
- Indexes: prescription number and patient-driven lookups
- Unique constraints: prescription number
- Status enums: created, pending, partial, dispensed patterns
- Soft delete: none
- Tenant scope: currently implicit through patient and visit
- Audit behavior: dispensing transitions are important

## labrequests and labresults

- Purpose: Laboratory workflow tracking
- Important fields: request number, patient refs, result values, verification state
- Relationships: patients, visits, users
- Indexes: request identifiers and operational status fields
- Status enums: pending, acknowledged, processing, verified patterns
- Soft delete: none
- Tenant scope: currently implicit through patient and visit
- Audit behavior: verification is sensitive and operationally tracked

## vaccinationrecords

- Purpose: Stores administered vaccine records
- Important fields: certificate number, patient, dose number, administered date
- Relationships: patients, vaccines, schedules
- Indexes: patient/date and certificate identifiers
- Status enums: completed record lifecycle in related workflows
- Soft delete: none
- Tenant scope: currently implicit through patient and facility workflows
- Audit behavior: stock and record integrity are important

## organizations

- Purpose: Multi-PHC platform organization root
- Important fields: `organizationCode`, `name`, `type`, `featureFlags`
- Required fields: `organizationCode`, `name`
- Relationships: facilities, users, consents, camps
- Indexes: organization code
- Unique constraints: organization code
- Tenant scope: top-level tenant root

## facilities

- Purpose: Facilities, outreach camps, sub-centres, and referral endpoints
- Important fields: `facilityCode`, `organization`, `facilityType`, `name`
- Required fields: `facilityCode`, `organization`, `name`
- Relationships: users, patients, consents, referrals, devices
- Indexes: facility code and organization/name
- Unique constraints: facility code
- Tenant scope: active facility boundary

## consents

- Purpose: Captures sharing and referral permissions
- Important fields: `patient`, `sourceFacility`, `receivingFacility`, `consentType`, `status`
- Required fields: patient, organization, source facility, receiving facility, type, purpose
- Relationships: patients, facilities, referrals
- Indexes: patient/source/receiving/type/status
- Status enums: active, expired, revoked, denied, pending
- Tenant scope: organization and facility scoped

## referrals

- Purpose: Inter-facility referral workflow
- Important fields: `referralNumber`, `patient`, `sourceFacility`, `destinationFacility`, `status`
- Required fields: referral number, patient, source, destination, reason
- Relationships: patients, facilities, users, consent
- Indexes: referral number and facility-driven lookups
- Unique constraints: referral number
- Status enums: draft to completed lifecycle
- Tenant scope: source and destination facilities

## aiaudits

- Purpose: Stores AI governance and review history
- Important fields: `feature`, `provider`, `model`, `outputStatus`, `accepted`, `rejected`
- Required fields: feature
- Relationships: users, patients, facilities, consent
- Indexes: feature and created time
- Status enums: generated, accepted, edited, rejected
- Tenant scope: facility-aware when applicable

## devices

- Purpose: Trusted workstation, kiosk, and tablet registration
- Important fields: `deviceId`, `facility`, `deviceType`, `trustedStatus`
- Required fields: `deviceId`, organization, facility, name
- Relationships: users, facilities
- Indexes: device ID, organization, facility
- Unique constraints: device ID
- Status enums: trusted boolean and revoked timestamp
- Tenant scope: organization and facility

## outreachcamps

- Purpose: Village outreach and field activity planning
- Important fields: `campNumber`, `facility`, `village`, `date`, `status`
- Required fields: camp number, organization, facility, village, date
- Relationships: facilities and future outreach records
- Indexes: camp number, facility, date
- Unique constraints: camp number
- Status enums: planned, active, completed, cancelled
- Tenant scope: organization and facility
