# MIT ADT Hub Backend

This backend centralizes:

- authentication and session lifecycle
- dynamic data APIs (faculty, tasks, announcements/events, profile)
- email OTP signup flow via Brevo

## Run Locally

1. Copy `.env.example` to `.env`.
2. Fill Firebase Admin credentials and JWT secrets.
3. Add Brevo API key for OTP mailing.
4. Start backend:

```bash
npm run backend:dev
```

Backend runs at `http://localhost:8080` by default.

## API Routes

- `GET /api/health`
- `POST /api/auth/google`
- `POST /api/auth/email/request-otp`
- `POST /api/auth/email/verify-signup`
- `POST /api/auth/email/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `GET /api/faculty`
- `GET /api/hub/announcements`
- `GET /api/hub/events`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

## Notes

- Refresh token is kept in an `httpOnly` cookie.
- Access token is returned in JSON response and should be sent as:
  `Authorization: Bearer <access-token>`.
- Email/password auth is custom and stored in `user_credentials` collection.
- Google auth route expects a Firebase client `idToken`.
