# Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
flowchart LR
  User[Users and Evaluators] --> Frontend[React PWA Frontend]
  Frontend --> API[Express API]
  Frontend --> IDB[IndexedDB Offline Cache]
  API --> Mongo[(MongoDB)]
  API --> Socket[Socket.IO]
  API --> Export[PDF and Excel Export Services]
  API --> Notify[Notification Adapters]
```

## 2. Frontend Architecture

```mermaid
flowchart TD
  Main[main.jsx] --> Contexts[Auth Theme Connectivity Contexts]
  Contexts --> Router[React Router]
  Router --> Shell[AppShell]
  Shell --> Pages[Workflow Pages]
  Pages --> Services[API Socket Offline Services]
```

## 3. Backend Layered Architecture

```mermaid
flowchart TD
  Routes --> Controllers --> Services --> Repositories --> Models[(Mongoose Models)]
  Controllers --> Utils
  Services --> Validators
  Services --> Socket
```

## 4. Database Relationship Overview

```mermaid
erDiagram
  USER ||--o{ APPOINTMENT : creates
  PATIENT ||--o{ APPOINTMENT : books
  PATIENT ||--o{ VISIT : has
  VISIT ||--o{ PRESCRIPTION : generates
  VISIT ||--o{ LAB_REQUEST : generates
  PATIENT ||--o{ VACCINATION_RECORD : receives
  ORGANIZATION ||--o{ FACILITY : contains
  PATIENT ||--o{ CONSENT : grants
  PATIENT ||--o{ REFERRAL : referred
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend
  U->>F: Login
  F->>B: POST /auth/login
  B-->>F: Access token, refresh token, user profile
  F->>F: Store session and active facility
  F->>B: Authenticated requests
```

## 6. Patient Registration Flow

```mermaid
flowchart LR
  Reception --> Form[Patient Form]
  Form --> Validate[Validation]
  Validate --> Save[Patient Save]
  Save --> ID[Patient ID and QR]
  ID --> Profile[Patient Profile]
```

## 7. Appointment And Queue Flow

```mermaid
flowchart LR
  Book[Book Appointment] --> CheckIn[Check In]
  CheckIn --> Queue[Token Queue]
  Queue --> Call[Call Token]
  Call --> Consult[Consultation]
  Consult --> Complete[Complete Visit]
```

## 8. Consultation Flow

```mermaid
flowchart TD
  Open[Open Patient] --> History[Review History]
  History --> Vitals[Record Vitals]
  Vitals --> Notes[Complaint and Diagnosis]
  Notes --> Rx[Prescription]
  Notes --> Lab[Lab Request]
  Rx --> Finish[Complete Consultation]
  Lab --> Finish
```

## 9. Pharmacy Workflow

```mermaid
flowchart LR
  PendingRx[Pending Prescription] --> Batch[Select Batch]
  Batch --> Dispense[Dispense Medicine]
  Dispense --> Stock[Update Stock]
  Stock --> Timeline[Patient Timeline]
```

## 10. Laboratory Workflow

```mermaid
flowchart LR
  Request --> Sample[Collect Sample]
  Sample --> Process[Process Test]
  Process --> Result[Enter Result]
  Result --> Verify[Verify Report]
  Verify --> Notify[Doctor Notification]
```

## 11. Vaccination Workflow

```mermaid
flowchart LR
  DueList --> SelectPatient
  SelectPatient --> RecordDose
  RecordDose --> UpdateStock
  UpdateStock --> Certificate
  Certificate --> NextDose
```

## 12. Notification Flow

```mermaid
flowchart LR
  Event[Business Event] --> NotificationService
  NotificationService --> PreferenceCheck
  PreferenceCheck --> InApp
  PreferenceCheck --> Email
  PreferenceCheck --> SMS
  PreferenceCheck --> Push
```

## 13. Offline Synchronization Flow

```mermaid
flowchart TD
  Offline[Offline Action] --> Draft[Draft or Pending Mutation]
  Draft --> IDB[IndexedDB]
  NetworkRestored --> Sync[Sync Queue]
  Sync --> Resolve[Conflict or Success]
```

## 14. Multi-PHC Tenant Hierarchy

```mermaid
flowchart TD
  Org[Organization] --> Region[Region]
  Region --> District[District]
  District --> Facility[Facility]
  Facility --> Department[Department]
  Department --> Users[Users]
```

## 15. Consent And Referral Flow

```mermaid
flowchart LR
  Doctor --> ReferralDraft
  ReferralDraft --> ConsentCapture
  ConsentCapture --> SendReferral
  SendReferral --> ReceivingFacility
  ReceivingFacility --> AcceptOrReject
```

## 16. AI Human-Review Flow

```mermaid
flowchart LR
  UserSelection --> Redaction
  Redaction --> DraftAIOutput
  DraftAIOutput --> Review
  Review --> Accept
  Review --> Edit
  Review --> Reject
  Accept --> Audit
  Edit --> Audit
  Reject --> Audit
```

## 17. Deployment Architecture

```mermaid
flowchart LR
  Browser --> FrontendHost[Frontend Hosting]
  FrontendHost --> BackendHost[Backend API Host]
  BackendHost --> MongoDB[(MongoDB)]
```

## 18. CI/CD Pipeline

```mermaid
flowchart LR
  Push[Git Push] --> Install[Install]
  Install --> Build[Build]
  Build --> Verify[Verification]
  Verify --> Release[Release Packaging]
```
