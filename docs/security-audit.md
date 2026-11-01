# Security audit

Implemented controls include bcrypt password hashing, JWT verification, route-role guards, request IDs and structured logs, Helmet, validation with Zod, authentication rate limits, explicit CORS allowlisting, MongoDB uniqueness/index constraints, production-safe error responses, and administrative protection for dependency diagnostics.

Open controls requiring operational completion: deploy behind Render HTTPS; store secrets only in Render; configure Atlas network controls, backups, monitoring, and least-privilege users; complete penetration testing; review authorization for every newly added endpoint; and configure a local QR renderer before processing real patient data.

No claim of compliance with Indian health-data, DPDP, or other regulation is made. Obtain specialist legal and security review before processing real data.
