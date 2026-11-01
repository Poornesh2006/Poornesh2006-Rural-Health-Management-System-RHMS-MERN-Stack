# Database backup and restore procedure

Use MongoDB Atlas scheduled backups for production. Restrict backup access, encrypt exports, test restores into a separate isolated database, and record the restore date, operator, source snapshot, checksum, and validation result.

Never restore over a production database without written approval, a tested rollback plan, and a maintenance window. Confirm record counts, indexes, authentication, and a small set of authorized patient lookups after restoration. The repository’s backup utilities are not a substitute for managed Atlas backups and an approved disaster-recovery plan.
