# Rural Health Management System

Project banner placeholder

RHMS is a MERN-based Rural Health Management System designed for academic demonstration and portfolio presentation. It supports patient registration, visit history, appointments, token queue, consultation, pharmacy, laboratory, vaccination, analytics, offline-first workflows, English and Tamil UI, notifications, multi-PHC foundations, consent-controlled referrals, and safe AI-assisted review tools.

## Problem Statement

Rural Primary Health Centres often depend on paper-based workflows that make patient history retrieval slow, duplicate registration common, queue management inefficient, medicine visibility weak, lab follow-up delayed, and vaccination tracking difficult in low-connectivity environments.

## Key Features

- Authentication with JWT, refresh tokens, RBAC, and session controls
- Patient registration, visit history, QR lookup, and clinical profile timeline
- Appointment booking, doctor schedule slots, check-in, and token queue
- Consultation workflow with prescription and lab request generation
- Pharmacy inventory, dispensing, low-stock visibility, and batch-aware handling
- Laboratory request lifecycle, result entry, verification, and review notifications
- Vaccination scheduling, stock tracking, certificate generation, and due-list workflows
- Executive analytics, reports, PDF/Excel/CSV exports, and village-level summaries
- In-app notifications with preferences plus demo-safe email/SMS/push adapters
- PWA support, offline drafts, queued sync, and connectivity indicators
- English and Tamil interface support
- Multi-PHC platform foundations, referrals, consents, FHIR-style export, AI governance, outreach, and device management

## Screenshots

Screenshot placeholders:

- Login
- Dashboard
- Patient registration
- Token queue
- Consultation
- Pharmacy
- Laboratory
- Vaccination
- Analytics
- Referral workflow
- AI review

See [docs/screenshot-guide.md](docs/screenshot-guide.md).

## Demo Link

Deployment link placeholder

## Technology Stack

- Frontend: React, React Router, Tailwind CSS, Framer Motion, Axios
- Backend: Node.js, Express, Mongoose, Zod, JWT
- Database: MongoDB
- Realtime: Socket.IO
- Reporting: PDFKit, XLSX
- PWA and Offline: Vite PWA, IndexedDB

## Architecture Overview

- Frontend app shell with role-aware routes and reusable UI primitives
- Express backend with controllers, services, repositories, validators, and middleware
- MongoDB collections for clinical, operational, notification, platform, and governance workflows
- Offline queue and sync layer in the frontend
- Tenant and facility context layer for platform-readiness

See:

- [docs/architecture.md](docs/architecture.md)
- [docs/architecture-diagrams.md](docs/architecture-diagrams.md)
- [docs/database-dictionary.md](docs/database-dictionary.md)
- [docs/api-reference.md](docs/api-reference.md)

## Quick Start

Backend:

```powershell
cd "backend"
npm.cmd install
npm.cmd run dev
```

Frontend:

```powershell
cd "frontend"
npm.cmd install
npm.cmd run dev
```

Open:

- Frontend: `http://localhost:5173/login`
- Backend health: `http://localhost:5000/health`

## Environment Setup

Create `backend/.env` from `backend/.env.example`.

Important variables are documented in [docs/installation-guide.md](docs/installation-guide.md).

## Demo Accounts

Development demo credentials are documented in [docs/demo-guide.md](docs/demo-guide.md).

## Folder Structure

```text
.
|-- backend
|-- docs
|-- frontend
|-- submission
|-- CHANGELOG.md
|-- RELEASE_NOTES.md
`-- VERSION
```

## API Overview

Primary endpoint groups:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/patients`
- `/api/v1/appointments`
- `/api/v1/queue`
- `/api/v1/consultations`
- `/api/v1/pharmacy`
- `/api/v1/laboratory`
- `/api/v1/vaccination`
- `/api/v1/reports`
- `/api/v1/analytics`
- `/api/v1/notifications`
- `/api/v1/platform`
- `/health`, `/health/live`, `/health/ready`, `/health/dependencies`

## Security

- JWT authentication and refresh-token workflow
- Role-based authorization
- Session revocation support
- Helmet, CORS, validation, and structured logging
- Audit logging and privacy-aware exports
- AI review-only workflow with disclaimer and audit trail

## Offline Support

- IndexedDB-backed drafts
- Pending mutation queue
- Online/offline detection
- Manual sync controls
- Local cache cleanup on logout

## Tamil Support

English and Tamil UI foundations are available with role-safe interface translation support.

## AI Safety

AI-generated content is for assistance only. It must be reviewed and approved by an authorized healthcare professional before use.

## Testing And Verification

Verified in this repository:

- Backend import verification for major platform layers
- Frontend production build

Not fully available in current scripts:

- backend lint
- frontend lint
- backend tests
- frontend tests
- end-to-end tests
- Docker build scripts

## Deployment

See [docs/deployment-guide.md](docs/deployment-guide.md).

## Documentation Links

- [Project Report](docs/project-report.md)
- [Presentation Outline](docs/presentation-outline.md)
- [Demo Script](docs/demo-script.md)
- [Viva Preparation](docs/viva-preparation.md)
- [Demo Fallback Plan](docs/demo-fallback-plan.md)
- [Installation Guide](docs/installation-guide.md)
- [Troubleshooting Guide](docs/troubleshooting-guide.md)
- [Module Docs Index](docs/modules/README.md)

## Future Roadmap

- Complete full tenant enforcement across all legacy modules
- Add richer seeded demo datasets and guided tours
- Expand FHIR resources and integration adapters
- Add automated lint, test, and Docker workflows
- Add production-grade mobile companion and kiosk flows

## Contributors

Contributor placeholder

## License

License decision pending project owner selection.

## Disclaimer

This project is for academic and demonstration purposes unless formally deployed and validated. It does not replace qualified medical judgment. AI features require authorized human review. Demo data is synthetic. Real-world deployment requires legal, privacy, security, and clinical validation.
