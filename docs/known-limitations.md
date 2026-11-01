# Known limitations

- Production deployment has been prepared but not performed because no Render or MongoDB Atlas account access was supplied.
- No local QR library is currently installed; the existing card image endpoint receives the newly opaque QR value only. Use a local encoder before handling non-demo patient data.
- A separate nurse permission is not represented by the existing authorization schema; nurse-labelled demo users are health workers.
- Automated browser E2E tests and CI are not yet configured.
