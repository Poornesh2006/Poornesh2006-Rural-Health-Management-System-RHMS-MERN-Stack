# Database Performance Review

## Review Status

Explain plans and slow-query instrumentation were not executed in this pass.

## Index Observations From Code Review

- Patients have patient ID, phone, created-at, and text indexes
- Appointments have doctor/date/slot, patient/date, and facility/date/status indexes
- Visits have patient/date and facility/date indexes
- Notifications and platform models define operational lookup indexes

## Risks

- Tenant scoping was added incrementally and may still need compound index refinement in legacy models
- Search-heavy text queries may need explain-plan tuning under larger demo datasets
- Frontend bundle warning suggests application-side optimization is also still needed

## Recommended Next Steps

- Run explain plans against patient search, appointment list, queue, and referral list
- Add tenant compound indexes for heavily filtered legacy collections
- Review duplicate or stale indexes after data migration scripts exist
