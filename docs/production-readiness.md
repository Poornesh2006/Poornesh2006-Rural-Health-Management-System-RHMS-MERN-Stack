# Production readiness

The API does not insert accounts, patients, stock, schedules, templates, or other content at startup. Provision all production records through authenticated, approved workflows.

Before using RHMS with any real patient information, provision the first administrator through a reviewed operational process, populate clinical catalogues only from approved local sources, configure retention/consent policies, perform a privacy impact assessment, and obtain independent legal, security, and clinical governance approval. This project does not claim regulatory compliance.

Run `npm.cmd run audit:synthetic-data` against a candidate database before deployment. It is read-only and reports known synthetic namespaces/identifiers. Do not delete anything based solely on this report; obtain explicit approval and use a reviewed migration/cleanup runbook.
