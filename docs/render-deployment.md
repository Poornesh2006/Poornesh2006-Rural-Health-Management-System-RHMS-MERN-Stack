# Render deployment

The repository is configured for two Render services in `render.yaml`: a Node API and a static Vite frontend. This keeps API secrets server-side and supports React Router rewrites on refresh.

1. Create a MongoDB Atlas database user with a least-privilege application account and permit only the Render egress/network path required by your plan.
2. Push the repository, create a Render Blueprint from `render.yaml`, and enter the secret values marked `sync: false`.
3. Deploy the API first. Its health check is `/health/ready`; wait for a 200 response.
4. Set the frontend `VITE_API_URL` to `https://YOUR-API.onrender.com/api/v1`, then deploy the static service.
5. Set the API `CORS_ORIGIN` and `FRONTEND_URL` to the actual frontend URL, redeploy the API, and run the smoke checklist.

Do not run unreviewed data-cleanup operations against a shared or production database.
