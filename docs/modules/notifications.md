# Notifications

- Purpose: Central operational alerts and reminders
- Users: All authenticated users
- Workflow: receive in-app notices, update preferences, mark read
- Data model: `notifications`, `notificationpreferences`, `notificationtemplates`
- APIs: `/notifications`
- Main pages: notification center, header panel, settings
- Permissions: authenticated user
- Error cases: provider failure, preference-disabled delivery
- Security controls: privacy-safe message content and logging redaction
- Tests: manual fetch and read-state interactions
- Known limitations: full external provider verification not completed
