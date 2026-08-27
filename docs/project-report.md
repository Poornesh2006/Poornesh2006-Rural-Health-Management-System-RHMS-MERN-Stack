# Project Report

## Abstract

Rural Primary Health Centres frequently operate with paper-based processes that make patient registration, history retrieval, queue coordination, follow-up tracking, medicine visibility, laboratory reporting, and vaccination continuity difficult to manage efficiently. These challenges become more severe in environments with limited infrastructure, shared workstations, and weak internet connectivity. The Rural Health Management System (RHMS) addresses these problems through a modular MERN-based digital platform designed for academic demonstration and future operational refinement. The system includes patient registration, longitudinal visit history, appointment scheduling, token-based queue management, doctor consultation support, pharmacy inventory and dispensing, laboratory workflow management, vaccination tracking, report generation, analytics, and controlled notifications. It also introduces Progressive Web App support, offline draft capture, queued synchronization, English and Tamil interface support, and privacy-conscious data handling. Beyond single-facility use, RHMS includes early platform foundations for multi-PHC workflows, consent-controlled referrals, device management, outreach operations, and safe AI assistance that remains strictly review-only. The solution emphasizes usability, modular architecture, role-based access control, auditability, and presentation readiness for academic evaluation. Although it is not a clinically validated deployment system, RHMS demonstrates how digital workflow design can improve the clarity, traceability, and accessibility of rural healthcare operations while respecting privacy, connectivity, and operational constraints.

## Chapter 1: Introduction

### Background

Rural healthcare environments often rely on fragmented manual processes for registration, consultation tracking, medicine handling, and follow-up coordination.

### Problem Statement

Paper records increase duplicate registration, make history retrieval difficult, and slow operational workflows across queue, lab, and pharmacy modules.

### Need For The Project

A digital system can improve operational continuity, reporting, transparency, and role-based access in a rural care setting.

### Proposed Solution

RHMS provides a role-aware web platform that centralizes patient and operational workflows using a MERN architecture with offline-first support.

### Objectives

- Digitize patient registration and visit history
- Improve queue and appointment workflows
- Support medicine, lab, and vaccination operations
- Provide analytics and reporting
- Support offline capture and multilingual usability

### Scope

The project covers primary-health operational workflows, presentation-ready analytics, offline support, and academic demonstration features.

### Limitations

This system is not a substitute for validated clinical software and does not implement autonomous diagnosis or prescribing.

## Chapter 2: Literature and Existing-System Review

### Existing Paper-Based Workflow

Manual registers and departmental handoffs increase delays and inconsistency.

### Problems In Existing Systems

- Duplicate records
- Long search time
- Poor stock visibility
- Weak follow-up management

### Digital Health-Management Systems

Digital systems can improve operational continuity, though many require infrastructure and localization support.

### Comparison With Proposed System

RHMS adds offline support, multilingual UI, queue operations, integrated modules, and privacy-conscious role control.

Citation placeholders requiring manual verification:

- `[Add verified citation on rural health digitization]`
- `[Add verified citation on offline-first healthcare systems]`

## Chapter 3: Requirement Analysis

### Functional Requirements

- Authentication and role-based access
- Patient registration and history
- Appointments and token queue
- Consultation, lab, pharmacy, vaccination
- Reports, analytics, notifications
- Offline draft capture

### Non-Functional Requirements

- Security
- Availability
- Accessibility
- Usability
- Maintainability
- Performance

### User Roles

- Admin
- Facility admin
- Receptionist
- Doctor
- Pharmacist
- Lab technician
- Health worker
- Read-only evaluator

### Use Cases

- Register patient
- Book appointment
- Call token
- Record consultation
- Dispense medicine
- Verify lab result
- Record vaccination
- Export report

### Hardware Requirements

- Desktop or laptop
- Internet connection for sync and multi-user flows
- Optional printer and QR-capable camera

### Software Requirements

- Node.js
- MongoDB
- Modern browser
- VS Code or equivalent development tooling

## Chapter 4: System Design

### Architecture

Frontend SPA, Express API, MongoDB persistence, Socket.IO realtime, and IndexedDB offline caching.

### Module Design

Modules are separated into role-driven workflows and reusable service boundaries.

### Database Design

Collections are organized by patient, operational, notification, governance, and platform domains.

### API Design

REST-style API groups are versioned under `/api/v1`.

### Security Design

JWT, RBAC, validation, health checks, logging, audit records, and session controls.

### Offline Design

Draft forms, pending mutations, cached lists, and manual resynchronization controls.

### Notification Design

Central notification records with preferences and channel adapters.

### Multi-PHC Design

Tenant context and facility-aware models with default single-PHC compatibility mode.

### AI Safety Architecture

AI outputs are assistance-only, review-required, redacted, and audit logged.

## Chapter 5: Implementation

### Frontend

React app shell, page routing, presentation pages, and workflow-specific screens.

### Backend

Express controllers, services, repositories, validators, middleware, and health endpoints.

### Database

MongoDB with Mongoose models and indexes.

### Authentication

JWT access tokens, refresh tokens, session list and revocation support.

### Patient Module

Patient ID generation, registration, update, archive, and clinical profile timeline.

### Appointment Module

Doctor scheduling, booking, check-in, and appointment lifecycle transitions.

### Queue

Live queue sections with Socket.IO-driven updates.

### Doctor Consultation

Vitals, complaint, diagnosis, prescriptions, lab requests, and follow-up scheduling.

### Pharmacy

Inventory batches, stock movements, and prescription dispensing.

### Laboratory

Request acknowledgment, sample collection, result entry, and report verification.

### Vaccination

Due lists, stock deduction, record creation, certificate tracking, and next-dose scheduling.

### Reports

Preview, saved definitions, and PDF/Excel/CSV export.

### Offline Support

Connectivity context, IndexedDB stores, draft persistence, cached list fallback, and queued sync.

### AI Assistance

Review-only visit summary drafts and duplicate detection examples.

## Chapter 6: Testing

### Unit Testing

Not fully available as runnable scripts in the current package configuration.

### Integration Testing

Backend import verification was used for recent platform layers.

### End-To-End Testing

Not fully automated in this repository.

### Security Testing

Manual review of auth, session, logging, and tenant foundations.

### Accessibility Testing

Manual UI review basis with remaining formal audit still required.

### Performance Testing

Frontend production builds were run; bundle-size warning remains.

### User Acceptance Testing

Manual workflow walkthrough readiness has been prepared for demo scenarios.

## Chapter 7: Results

### Completed Workflows

- Registration
- Appointment and queue
- Consultation
- Pharmacy
- Laboratory
- Vaccination
- Reports and analytics
- Notifications
- Offline-ready behavior
- Presentation and documentation pages

### Screenshot Placeholders

Refer to [docs/screenshot-guide.md](screenshot-guide.md).

### Performance Observations

Production frontend build succeeds, but bundle-size reduction remains an improvement area.

### System Benefits

Improved operational visibility, presentation readiness, and structured healthcare workflow modeling.

## Chapter 8: Conclusion

### Achievements

RHMS demonstrates a broad, modern healthcare operations platform suitable for academic presentation and future refinement.

### Limitations

Formal test/lint automation, guided tours, and production deployment hardening still need completion.

### Future Scope

- Expanded tenant enforcement
- React Native companion
- Richer demo seeding and reset tools
- Formal integration adapters and production validation

## Appendices

### API List

See [docs/api-reference.md](api-reference.md).

### Database Collections

See [docs/database-dictionary.md](database-dictionary.md).

### Environment Variables

See [docs/installation-guide.md](installation-guide.md).

### Demo Credentials

See [docs/demo-guide.md](demo-guide.md).

### User Manual

Existing role-focused user instructions can be consolidated from module docs.

### Test Summary

Verified commands are summarized in Phase completion notes and release material.
