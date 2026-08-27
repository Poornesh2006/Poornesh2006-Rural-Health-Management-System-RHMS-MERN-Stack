# Production Configuration Checklist

- [ ] `NODE_ENV=production`
- [ ] Frontend API URL points to real backend
- [ ] MongoDB URI uses secured production database
- [ ] JWT secrets replaced with strong values
- [ ] CORS restricted to production frontend
- [ ] Demo mode disabled
- [ ] Demo reset disabled
- [ ] SMTP configured or mock mode intentionally disabled
- [ ] SMS provider intentionally configured or disabled
- [ ] Push keys configured if used
- [ ] Source maps protected appropriately
- [ ] Debug logging minimized
- [ ] Health endpoints reachable
- [ ] API docs protected if exposed
- [ ] AI provider disabled or safely sandboxed unless explicitly approved

## Verified In This Repository Pass

- Environment schema validation exists
- Health endpoints exist

## Not Verified

- Real hosted configuration values
- Cloudinary or object storage
- Sentry
- Redis or external scheduler
