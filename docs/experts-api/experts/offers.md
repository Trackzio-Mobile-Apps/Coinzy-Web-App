# Expert — Offers

All endpoints in this section require **expert JWT** authentication via `Authorization: Bearer <token>`.

---

## List My Offers

### `GET /experts/me/offers`

Returns only the authenticated expert's active, non-expired `offered` rows.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "offers": [
      {
        "_id": "507f1f77bcf86cd799439041",
        "round": 1,
        "status": "offered",
        "expiresAt": "2026-06-24T00:00:00.000Z",
        "offeredAt": "2026-06-22T00:00:00.000Z",
        "request": {
          "_id": "507f1f77bcf86cd799439077",
          "displayId": "EV-7K3P9Q2A",
          "coinTitle": null,
          "country": "IN",
          "payload": {},
          "status": "offered",
          "assignedExpertId": null,
          "deadlineAt": "2026-06-25T00:00:00.000Z",
          "acceptedAt": null,
          "submittedAt": null,
          "completedAt": null,
          "updatedAt": "2026-06-22T00:00:00.000Z",
          "firstAcceptanceWindowEndsAt": "2026-06-23T00:00:00.000Z",
          "ttlExpiresAt": "2026-06-24T00:00:00.000Z",
          "createdAt": "2026-06-22T00:00:00.000Z"
        }
      }
    ]
  }
}
```

`displayId` is for display only. Expert actions continue to use the MongoDB Request `_id` or the relevant offer `_id`.

---

## Skip Offer

### `POST /experts/offers/:offerId/skip`

Declines an offer without accepting it.

When the request is still unassigned and `offered`, the backend immediately
tries to offer it to the next highest-ranked eligible external expert. This
refill keeps the existing timed first-window and TTL lifecycle unchanged.

If no eligible external expert remains, the skip still succeeds as a safe
no-op for allocation progression. The request keeps its current status and
timers, and the existing internal-expert / TTL fallback behavior remains in
place.

- Auth: expert JWT
- Body: none

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "offer": {
      "_id": "507f1f77bcf86cd799439041",
      "requestId": "507f1f77bcf86cd799439077",
      "expertId": "507f1f77bcf86cd799439031",
      "round": 1,
      "status": "skipped",
      "offeredAt": "2026-06-22T00:00:00.000Z",
      "expiresAt": "2026-06-24T00:00:00.000Z",
      "respondedAt": "2026-06-22T00:10:00.000Z"
    }
  }
}
```

**Errors:** `404` offer not found or not owned by this expert, `409` offer not skippable or already expired

**409 response shape:** returns the standard error envelope with `data.status`,
for example `{ "error": true, "message": "Offer expired", "data": { "status": "expired" } }`

---

## Accept Offer

### `POST /experts/offers/:offerId/accept`

Accepts an offer to work on the request.

- Auth: expert JWT
- Body: none

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439077",
      "displayId": "EV-7K3P9Q2A",
      "coinTitle": null,
      "country": "IN",
      "payload": {},
      "status": "accepted",
      "assignedExpertId": "507f1f77bcf86cd799439031",
      "deadlineAt": "2026-06-25T00:00:00.000Z",
      "acceptedAt": "2026-06-22T00:15:00.000Z",
      "submittedAt": null,
      "completedAt": null,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:15:00.000Z",
      "firstAcceptanceWindowEndsAt": "2026-06-23T00:00:00.000Z",
      "ttlExpiresAt": "2026-06-24T00:00:00.000Z"
    },
    "offer": {
      "_id": "507f1f77bcf86cd799439041",
      "requestId": "507f1f77bcf86cd799439077",
      "expertId": "507f1f77bcf86cd799439031",
      "round": 1,
      "status": "accepted",
      "offeredAt": "2026-06-22T00:00:00.000Z",
      "expiresAt": "2026-06-24T00:00:00.000Z",
      "respondedAt": "2026-06-22T00:15:00.000Z"
    }
  }
}
```

**Errors:** `404` offer not found or not owned by this expert, `409` offer expired or request no longer available

**409 response shape:** returns the standard error envelope and may include
additional `data` from the conflict path; some conflicts return an empty
object.

---

## List My Request History

### `GET /experts/me/requests`

Returns the authenticated expert's assigned request history across request lifecycle states.

- Auth: expert JWT
- Query: 
  - `status` (optional, repeatable): e.g. `?status=accepted&status=deadline_missed`
  - `createdAfter` (optional): Unix timestamp in milliseconds for start of range, e.g. `?createdAfter=1719172800000`
  - `createdBefore` (optional): Unix timestamp in milliseconds for end of range, e.g. `?createdBefore=1719345600000`

When no `status` query is provided, the endpoint returns all requests currently assigned to this expert in stored history. Offer-only rows are excluded; those remain on `GET /experts/me/offers`. Date range filters are applied to the request `createdAt` timestamp.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439077",
        "displayId": "EV-7K3P9Q2A",
        "coinTitle": null,
        "country": "IN",
        "payload": {},
        "status": "accepted",
        "assignedExpertId": "507f1f77bcf86cd799439031",
        "reportId": null,
        "firstAcceptanceWindowEndsAt": "2026-06-23T00:00:00.000Z",
        "ttlExpiresAt": "2026-06-24T00:00:00.000Z",
        "deadlineAt": "2026-06-25T00:00:00.000Z",
        "acceptedAt": "2026-06-22T00:15:00.000Z",
        "submittedAt": null,
        "completedAt": null,
        "createdAt": "2026-06-22T00:00:00.000Z",
        "updatedAt": "2026-06-22T00:15:00.000Z"
      }
    ]
  }
}
```

The expert Request shape excludes the mobile user's identity, FCM token, credit-ledger linkage, internal fallback linkage, previous-expert history, and allocation bookkeeping.

**Errors:** 
- `400` unsupported request status filter
- `400` invalid or malformed `createdAfter` or `createdBefore` timestamp
