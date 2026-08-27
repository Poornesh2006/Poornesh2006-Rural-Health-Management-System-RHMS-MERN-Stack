# UAT Plan

## Scope

Role-based User Acceptance Testing for Admin, Doctor, Receptionist, Pharmacist, Lab Technician, Health Worker, and Evaluator.

## Execution Model

- Environment: local development
- Dataset: synthetic demo data only
- Evidence: screenshots, terminal logs, exports, and walkthrough notes
- Retest: required after every Severity 1 or Severity 2 fix

## Core UAT Cases

### UAT-ADM-001

- Role: Admin
- Preconditions: Admin account available
- Steps: Login, open analytics, reports, settings, and platform page
- Expected result: Admin-only areas load without authorization errors

### UAT-REC-001

- Role: Receptionist
- Preconditions: Reception account and backend running
- Steps: Search patient, register patient, book appointment, open queue
- Expected result: Patient and appointment workflows succeed

### UAT-DOC-001

- Role: Doctor
- Preconditions: Queue contains patient
- Steps: Open doctor page, review history, start and complete consultation
- Expected result: Visit completion and downstream prescription/lab flows succeed

### UAT-PHA-001

- Role: Pharmacist
- Preconditions: Pending prescription exists
- Steps: Open pharmacy, select batch, dispense medicine
- Expected result: Stock decreases and dispensing record is created

### UAT-LAB-001

- Role: Lab Technician
- Preconditions: Pending lab request exists
- Steps: Acknowledge request, collect sample, enter result, verify
- Expected result: Report becomes verified and reviewable

### UAT-VAC-001

- Role: Health Worker
- Preconditions: Vaccination due list exists
- Steps: Open vaccination page, record dose, verify next due state
- Expected result: Dose is recorded and stock updates

### UAT-ANA-001

- Role: Admin
- Preconditions: Analytics data available
- Steps: Open analytics and reports, export one format
- Expected result: Preview and export routes work

### UAT-OFF-001

- Role: Operational role
- Preconditions: Browser running frontend
- Steps: Go offline, save draft, return online, retry sync
- Expected result: Draft persists and queued actions remain visible

### UAT-TAM-001

- Role: Any
- Preconditions: Frontend running
- Steps: Switch language to Tamil and inspect major navigation and forms
- Expected result: Labels render without obvious clipping or broken unicode
