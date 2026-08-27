# Deployment Guide

## Intended Targets

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or similar Node host
- Database: MongoDB Atlas

## Frontend Deployment

- Build command: `npm.cmd run build`
- Output directory: `frontend/dist`
- Configure `VITE_API_URL` for production API endpoint

## Backend Deployment

- Start command: `npm.cmd run start`
- Configure environment variables from the installation guide
- Point `MONGODB_URI` to managed MongoDB

## Production Safety Notes

- Use strong JWT secrets
- Restrict CORS to production frontend origin
- Keep demo mode disabled
- Do not expose development-only docs publicly without access control

## Verification Performed In This Repo

- Frontend production build completed
- Backend import verification completed

## Not Yet Fully Verified

- Docker image build
- Hosted deployment URL
- End-to-end production smoke testing
