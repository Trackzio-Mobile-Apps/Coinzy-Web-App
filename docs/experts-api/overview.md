# Coinzy Experts API

JSON responses use one envelope:

```json
{
  "error": false,
  "message": null,
  "data": {}
}
```

- **Success** responses set `error: false`
- **Error** responses set `error: true` and keep `data: {}`
- `/health` is the only plain-text exception and returns `OK`

---

## API Modules

### [Admin](admin/experts.md)

The **Admin** module provides privileged endpoints for managing experts and user credits. Admins authenticate via API key headers and can create, list, update, and change the status of expert accounts. They can also adjust user credit balances with a reason trail recorded in the credit ledger and create requests on behalf of existing mobile users.

- Expert CRUD (create, list, get, update, status changes)
- User credit adjustments with audit ledger
- On-behalf request creation for existing mobile users

---

### [Expert](experts/auth.md)

The **Expert** module covers the expert-facing side of the platform. Experts authenticate with email and password to receive a JWT, can control whether they are considered for future request allocation, then manage their incoming request offers — viewing active offers, skipping unwanted ones, or accepting a request to work on. After completing the work, experts submit reports through this module.

Acceptance does not start a new 72-hour work window. The request deadline is
set when the user creates the request, and on retry when the retry starts, so
an expert who accepts later has less remaining time than one who accepts
earlier.

- Authentication (login, profile, availability)
- Offer management (list, skip, accept)
- Assigned request history with optional status filters
- Report submission

---

### [Mobile User](mobile-user/profile.md)

The **Mobile User** module powers the end-user mobile experience. Users can view their profile and credit balance, browse active external experts, purchase credits via in-app purchases (Apple App Store & Google Play), create and track expert requests, retry deadline-missed requests, and read submitted reports.

Each new request receives a short `displayId` for evaluation cards, while its MongoDB `_id` remains the only API/integration identifier. Pending requests have no coin title; the assigned expert supplies `coinTitle` with the final report.

- Profile, credit balance & expert directory
- Media upload to public S3/CDN URLs
- In-app purchase verification (Apple & Google)
- Request lifecycle (create, list, retry)
- Report viewing

---

### Shared Cross-Cutting Topics

| Topic | Details |
|-------|---------|
| [Auth Modes](overview.md#auth-modes) | How each actor authenticates |
| [Realtime Notifications](overview.md#realtime-notifications) | Socket.IO events plus optional request-scoped mobile-user FCM |
| [Health & Docs](overview.md#health-and-docs) | Utility endpoints |
| [Manual Smoke Flow](manual-smoke-flow.md) | End-to-end testing sequence |

---

## Health And Docs

### `ANY /health`

- Auth: none
- Response: plain text `OK`

### `GET /docs`

- Auth: none
- Serves the docsify documentation from `public/`

---

## Auth Modes

| Actor | Credential |
|-------|-----------|
| **Mobile user** | `Authorization: Bearer <external-jwt>` |
| **Expert** | `Authorization: Bearer <expert-jwt>` |
| **Admin** | `x-admin-key: <ADMIN_API_KEY>` or `x-admin-api-key: <ADMIN_API_KEY>` |

Mobile-user JWTs are verified with `USER_JWT_SHARED_SECRET`. Expert JWTs are issued by `POST /experts/login`. This backend is single-app only and does not use `appCode` or multi-tenant config.

---

## Realtime Notifications

Socket.IO rooms are joined from handshake auth:

- `userId` → `user:{userId}` — mobile user receives user-targeted events
- `expertId` → `expert:{expertId}` — expert receives expert-targeted events
- `admin: true` → `admin` — admin receives all admin events

For mobile users, request-lifecycle events may also be sent through best-effort
FCM when the request was created or retried with `x-fcm-token`. Socket.IO
remains the baseline RTN path, and FCM failures do not affect API/database
flows.
Those request-scoped FCM messages use the same event names and mobile-user
payload shapes shown in the table below, encoded as Firebase `data.event` plus
JSON-stringified `data.payload`.

Experts also have a persistent replay inbox for actionable offer and deadline
events. It is available through `GET /experts/me/inbox`; the frontend updates
independent shown/read state with `PATCH /experts/me/inbox/:inboxItemId`.

Which actor receives each event is indicated in the table below.

### Best-effort RTN events

| Event | Mobile User | Expert | Admin | Payload |
|-------|:-----------:|:------:|:-----:|---------|
| `credit.updated` | ✅ | — | — | `{ creditBalance }` |
| `request.offered` | — | ✅ | ✅ | expert: `{ offerId, requestId, round, expiresAt }` / admin: `{ requestId, offerCount }` |
| `request.accepted` | ✅ | ✅ | ✅ | user/admin: `{ requestId, expertId, acceptedByFallback? }` / expert: `{ requestId, acceptedByFallback? }` |
| `request.withdrawn` | ✅ | ✅ | ✅ | `{ requestId, offerId }` |
| `request.deadline_missed` | ✅ | ✅ | ✅ | user: `{ requestId }` / expert/admin: `{ requestId, expertId? }` |
| `request.retry_started` | ✅ | — | ✅ | `{ requestId }` |
| `report.submitted` | ✅ | — | ✅ | user: `{ requestId, reportId }` / admin: `{ requestId, reportId, expertId }` |
