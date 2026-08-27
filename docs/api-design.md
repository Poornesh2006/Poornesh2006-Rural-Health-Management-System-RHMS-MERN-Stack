# API Design

Base path: `/api/v1`

## Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/profile`
- `POST /auth/change-password`

## Dashboard

- `GET /dashboard/summary`

## Users

- `GET /users`
- `POST /users`

## Patients

- `GET /patients`
- `POST /patients`
- `GET /patients/:patientId`
- `PATCH /patients/:patientId`
- `POST /patients/:patientId/archive`

## Visits

- `POST /visits`
- `GET /visits/patient/:patientId`

## Appointments

- `GET /appointments`
- `POST /appointments`
- `PATCH /appointments/:appointmentId`

## Tokens

- `GET /tokens/live`
- `POST /tokens`
- `PATCH /tokens/:tokenId/advance`

## Pharmacy

- `GET /pharmacy/medicines`
- `POST /pharmacy/medicines`
- `POST /pharmacy/dispense`

## Laboratory

- `GET /lab/reports`
- `POST /lab/reports`

## Analytics

- `GET /analytics/dashboard`
- `GET /analytics/villages`

## Response Envelope

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

## Error Envelope

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must contain 10 digits"
    }
  ]
}
```
