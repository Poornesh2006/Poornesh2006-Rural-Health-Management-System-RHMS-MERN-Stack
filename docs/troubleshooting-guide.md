# Troubleshooting Guide

## PowerShell blocks `npm`

Use `npm.cmd` instead of `npm`.

## Frontend says unable to sign in

- Make sure backend is running
- Confirm `http://localhost:5000/health` works
- Restart backend after code changes

## Backend startup fails

- Read the terminal log carefully
- Confirm MongoDB is running
- Confirm `backend/.env` exists

## Page loads but data is empty

- Check backend terminal for API errors
- Refresh the browser
- Verify login and role permissions

## Queue realtime not updating

- Refresh the queue page
- Check backend socket initialization
- Continue demo with manual refresh if needed

## Offline badge appears unexpectedly

- Confirm internet connectivity
- Retry sync from settings page

## Export fails

- Use report preview as fallback
- Retry after backend stabilization

## Tamil text wraps poorly

- Reduce zoom slightly or capture a cleaner state for presentation
- Keep line lengths shorter in demo data where practical
