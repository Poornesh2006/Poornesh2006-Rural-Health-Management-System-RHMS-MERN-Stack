# Demo Fallback Plan

## Internet Failure

- Detect: Connectivity indicator turns offline
- Safe fallback: Demonstrate offline draft capture and cached pages
- What to show: Offline badge, draft persistence explanation
- What to tell evaluator: "The system is designed to tolerate weak connectivity and queue safe mutations for later sync."
- Recovery: Restore connection and show manual sync

## Backend Unavailable

- Detect: API calls fail and pages stop loading live data
- Safe fallback: Use presentation dashboard, documentation, and cached UI pages
- What to show: Presentation page, screenshot guide, offline explanation
- What to tell evaluator: "The frontend shell and documentation remain available, and the backend health checks normally confirm readiness."
- Recovery: Restart backend using local terminal

## Database Unavailable

- Detect: Backend startup or data endpoints fail
- Safe fallback: Use prebuilt documentation, screenshots, and frontend pages with cached examples
- What to show: Project flow documentation and presentation dashboard
- Recovery: Start MongoDB locally and restart backend

## SMS Provider Unavailable

- Detect: SMS delivery failures or mock mode notice
- Safe fallback: Explain mock adapter and in-app notifications
- What to show: Notification center and provider-safe architecture
- Recovery: Switch to development mock provider

## Email Provider Unavailable

- Detect: Delivery logs or preview-mode state
- Safe fallback: Use development mail preview mode and in-app channel demonstration
- What to show: Notification preferences and logs
- Recovery: Reconfigure SMTP or continue with mock mode

## Deployment Unavailable

- Detect: Hosted URL not responding
- Safe fallback: Run local backend and frontend
- What to show: Local environment plus README quick-start
- Recovery: Use local demo setup

## QR Camera Unavailable

- Detect: Camera permission or hardware issue
- Safe fallback: Explain QR generation logic and open a patient by ID
- What to show: QR link or generated code reference
- Recovery: Use a different device or bypass to patient search

## Socket.IO Unavailable

- Detect: Queue does not refresh in realtime
- Safe fallback: Manual refresh of queue or appointment pages
- What to show: Queue workflow itself still works
- What to tell evaluator: "Realtime is an enhancement layer; operational state still persists via API."
- Recovery: Restart backend and reconnect frontend

## PDF Export Unavailable

- Detect: Export request fails
- Safe fallback: Show report preview and explain alternate CSV/Excel paths
- Recovery: Retry after backend stabilization

## AI Provider Unavailable

- Detect: AI requests fail
- Safe fallback: Use governance page and explain mock or disabled mode
- What to show: Review-only policy, disclaimer, and audit architecture
- Recovery: Retry or demonstrate documentation

## Local Docker-Based Fallback

- If Docker scripts are added later, keep a local compose-based demo pack ready
- In the current repository state, the practical fallback is the local Node + MongoDB development run path
