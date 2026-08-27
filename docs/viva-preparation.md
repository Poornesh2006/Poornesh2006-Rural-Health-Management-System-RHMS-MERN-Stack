# Viva Preparation

This document contains 100 concise viva questions and answers.

## Basic Questions

1. What is this project?
   RHMS is a MERN-based Rural Health Management System built for rural primary healthcare workflow digitization.
2. Why did you choose this topic?
   Rural health operations face paper-based delays, duplication, and weak visibility, which makes digitization highly relevant.
3. What problem does it solve?
   It improves record retrieval, queue visibility, follow-up coordination, stock awareness, and reporting.
4. Who are the users?
   Admins, receptionists, doctors, pharmacists, lab technicians, health workers, and evaluators.
5. Why is it important in rural healthcare?
   Because limited resources and connectivity require simple, resilient, and role-aware systems.
6. Is it a hospital management system?
   It is closer to a primary-health workflow platform than a full tertiary hospital ERP.
7. What is the main objective?
   To digitize patient registration and visit-history management in a rural PHC context.
8. What makes your solution different?
   Offline-first support, Tamil and English UI, queue workflow, analytics, and safe AI review boundaries.
9. Is the data real?
   No, demo data is synthetic and intended only for academic use.
10. Is it production deployed?
   It is prepared for demonstration and technical review, not claimed as a clinically validated deployment.

## MERN Questions

11. Why MongoDB?
   It is flexible for document-oriented healthcare and operational data models.
12. Why React?
   It supports reusable UI components, routing, and interactive workflow screens.
13. Why Express?
   It provides a lightweight and modular backend API framework.
14. Why Node.js?
   It supports the JavaScript full-stack model and works well with realtime workflows.
15. How does frontend communicate with backend?
   Through Axios-based HTTP API calls and Socket.IO for realtime updates.
16. Why use a monorepo?
   It keeps frontend, backend, and shared documentation together for coordinated development.
17. What is Vite used for?
   It powers fast frontend development and production builds.
18. Why Tailwind CSS?
   It speeds up consistent UI construction through utility classes.
19. Why Framer Motion?
   It provides controlled motion for page transitions and UI polish.
20. Why use Mongoose?
   It provides schemas, validation, indexes, and model abstraction over MongoDB.

## Authentication Questions

21. What is JWT?
   JSON Web Token is a signed token used to identify authenticated sessions.
22. What is a refresh token?
   It is a longer-lived token used to obtain a new access token without forcing a full login.
23. How are passwords stored?
   They are hashed using bcrypt, not stored as plain text.
24. What is RBAC?
   Role-Based Access Control, which restricts actions by user role.
25. Why use both access and refresh tokens?
   It balances security and usability by keeping access tokens shorter-lived.
26. How do you revoke sessions?
   Sessions can be listed and revoked through backend session management endpoints.
27. What happens when a token expires?
   The user must refresh the session or log in again depending on token state.
28. How is unauthorized access blocked?
   Middleware validates JWT and checks roles before protected endpoints are served.
29. Why avoid storing passwords in IndexedDB?
   Because offline storage should never contain sensitive authentication secrets.
30. What is session rotation?
   It is a practice where refresh tokens are updated or invalidated to reduce replay risk.

## Database Questions

31. What collections are used?
   Users, patients, visits, appointments, queue, prescriptions, lab records, vaccination records, notifications, organizations, facilities, consents, referrals, and more.
32. Why use indexes?
   To improve performance for frequent lookups such as patient search or queue filtering.
33. What is a unique constraint?
   A rule ensuring a field value, like patient ID or email, is not duplicated.
34. What is soft delete?
   Records are marked inactive or given a deletion timestamp instead of being fully removed.
35. Why is soft delete useful?
   It preserves auditability and reduces accidental permanent data loss.
36. What is a relationship in MongoDB here?
   Related records reference each other through IDs, such as patient-to-visit.
37. How do transactions help?
   They protect consistency across multi-step operations like dispensing or vaccination stock updates.
38. Why is document flexibility useful?
   Different modules have varying operational fields that evolve over time.
39. How do you prevent duplicate patients?
   Through search, validation, and AI-assisted duplicate candidate review foundations.
40. How is tenant scope added?
   Through organization and facility references with tenant-context middleware.

## Patient Module Questions

41. How is patient ID generated?
   It uses a generated pattern based on time-stamped utility logic.
42. How does QR lookup work?
   A patient QR value maps back to the patient identifier.
43. What details are stored for patients?
   Basic demographics, address, history flags, vitals, and linked records.
44. Can you view visit history?
   Yes, patient profile and clinical timeline pages aggregate key records.
45. How is age handled?
   It can be calculated from date of birth.
46. Why track village names?
   Village-level analytics and rural follow-up workflows depend on locality grouping.
47. Can patient data be archived?
   Yes, the model supports archived state.
48. How are allergies stored?
   As part of medical flags on the patient record.
49. Can patient details be edited?
   Yes, through secured update workflows.
50. Why keep a longitudinal profile?
   It improves continuity of care across repeat visits.

## Appointment And Queue Questions

51. How are appointments booked?
   Through a form connected to doctor schedules and slot availability.
52. What is the token queue?
   It is the live waiting workflow for patients moving toward consultation.
53. How are tokens updated in realtime?
   Socket.IO events refresh queue state for connected users.
54. Why separate appointments and queue?
   Because booking and live waiting are related but operationally distinct.
55. What statuses exist in queue workflows?
   Waiting, called, in consultation, completed, skipped, and related operational states.
56. How do you avoid duplicate queue actions?
   Backend service transitions and validation protect allowed state changes.
57. What is check-in?
   It marks an appointment as operationally present and ready for queue processing.
58. Can emergency priority be shown?
   Yes, priority escalation is part of the queue design.
59. Why is queue visibility useful?
   It helps reception and doctors coordinate care flow.
60. How does the public display differ?
   It shows limited queue information without exposing full clinical data.

## Pharmacy Questions

61. What is FEFO?
   First Expiry First Out, a stock strategy that prioritizes earlier-expiring batches.
62. How is stock consistency maintained?
   Through controlled update flows and transaction-aware service logic.
63. Why track medicine batches?
   Because expiry and lot-level availability matter in dispensing safety.
64. What is a dispensing record?
   It records what was issued, from which batch, and to whom.
65. Can stock go negative?
   The workflow is designed to prevent unsafe stock deduction.
66. What is low-stock alerting?
   A signal that inventory is near a configured threshold.
67. Why is pharmacy linked to consultation?
   Prescriptions originate from consultation workflows.
68. Can a pharmacist see pending prescriptions?
   Yes, pending dispensing workflows are supported.
69. Why track expiry?
   Expired stock must not be issued.
70. How does pharmacy affect timeline?
   Dispensing records can be reflected in the patient clinical timeline.

## Laboratory Questions

71. What are lab states in the workflow?
   Request, acknowledgment, sample collection, processing, result entry, and verification.
72. Why is verification important?
   Verified reports should be controlled and not casually altered.
73. Can verified results be edited freely?
   The system is designed to treat verified results as sensitive workflow states.
74. What is a critical alert demonstration?
   A safe operational example of flagging urgent attention without graphic content.
75. How is the doctor informed?
   Through notifications and workflow visibility.
76. Why separate requests and results?
   Because request initiation and report completion are different operational steps.
77. Can lab data appear in patient history?
   Yes, through clinical profile aggregation.
78. Why track sample collection?
   It provides traceability for test progress.
79. Why is lab turnaround useful in analytics?
   It measures operational efficiency.
80. Can lab flows be demonstrated offline?
   Draft or local states can be shown, but sensitive final verification should remain server-confirmed.

## Vaccination Questions

81. How is the next dose planned?
   Based on vaccine schedules and recorded administration history.
82. Why track batches for vaccines?
   Inventory integrity and batch accountability are important.
83. What is a vaccination certificate?
   A printable record tied to an administered dose.
84. How do due lists help?
   They support follow-up and outreach planning.
85. Can duplicate dose recording be prevented?
   The workflow is designed to check prior records and schedules.

## Offline Questions

86. Why IndexedDB?
   It supports structured local persistence for drafts, cached lists, and queued mutations.
87. What happens during a conflict?
   The system should surface a review state instead of silently overwriting data.
88. Which actions should not finish offline?
   Sensitive finalizations such as stock deduction, permission changes, and some verified records.
89. Why is offline support important?
   Rural workflows may face weak or unstable internet connectivity.
90. What is pending mutation sync?
   Locally queued actions replay when connectivity returns.

## Security Questions

91. How is patient data protected?
   Through authentication, authorization, validation, logging discipline, and controlled exports.
92. What is NoSQL injection?
   A type of attack where untrusted input manipulates database queries.
93. How is rate limiting used?
   Sensitive routes can be protected from abuse through request-throttling middleware.
94. Why redact logs?
   To avoid leaking passwords, tokens, or other sensitive data.
95. What is tenant isolation?
   It ensures one facility or organization cannot read another tenant's protected data without authorization.

## Analytics, AI, And Deployment Questions

96. How are reports generated?
   Through backend reporting services that support preview and export formats.
97. How is patient privacy protected in analytics?
   The system uses aggregated reporting patterns and avoids exposing unnecessary detail.
98. What AI features are included?
   Review-only summaries and duplicate detection assistance with disclaimers and audit logging.
99. Why is human review mandatory for AI?
   Because AI output must never autonomously enter a clinical record or replace authorized judgment.
100. What is future scope?
   Stronger automation of testing, richer demo tooling, expanded integrations, and deployment hardening.
