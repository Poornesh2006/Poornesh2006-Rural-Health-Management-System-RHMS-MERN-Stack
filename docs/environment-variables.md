# Environment variables

Copy `backend/.env.example` for the API and `frontend/.env.example` for the Vite build. Never commit populated `.env` files.

`CORS_ORIGIN` supports one or more comma-separated browser origins, for example `https://app.example.com,https://staging.example.com`. `VITE_API_URL` must include `/api/v1` and is public by design; do not put secrets in any `VITE_` variable.

Use unique long values for `JWT_SECRET` and `JWT_REFRESH_SECRET`. Set `MONGODB_URI` only in Render/Atlas-managed secrets.
