# Installation Guide

## Requirements

- Node.js
- MongoDB
- Modern browser

## Backend Setup

```powershell
cd "backend"
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

## Frontend Setup

```powershell
cd "frontend"
npm.cmd install
npm.cmd run dev
```

## Open The Application

- Frontend: `http://localhost:5173/login`
- Backend health: `http://localhost:5000/health`

## Important Note

Use `npm.cmd` in PowerShell environments where `npm.ps1` is blocked.

## Key Backend Environment Variables

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `CORS_ORIGIN`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `APP_BASE_URL`
- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMS_PROVIDER`
- `BACKUP_STORAGE_PATH`
- `BACKUP_ENCRYPTION_KEY`

## Demo Mode Hint

Set `VITE_DEMO_MODE=true` in frontend environment setup if you want the demo banner visible outside dev mode.
