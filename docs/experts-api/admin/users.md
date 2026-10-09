# Admin — Users

All endpoints in this section require the **admin API key** passed via `x-admin-key` or `x-admin-api-key` header.

---

## List Users

### `GET /admin/users`

Returns all mobile users sorted by creation date (newest first).

**Optional query parameter:**

- `email` — case-insensitive partial email search (`?email=alice` matches `alice@example.com`)

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "externalUserId": "ext-001",
        "name": "Alice",
        "email": "alice@example.com",
        "creditBalance": 10,
        "createdAt": "2026-06-22T00:00:00.000Z",
        "updatedAt": "2026-06-22T00:00:00.000Z"
      }
    ]
  }
}
```

---

## Adjust User Credits

### `POST /admin/users/:userId/credits/adjust`

Manually adjusts a user's credit balance with an audit trail.

**Request body:**

```json
{
  "amount": 1,
  "reason": "manual_grant"
}
```

- `amount` must be a non-zero integer
- The resulting balance cannot go negative
- A ledger entry is created recording the reason

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "creditBalance": 10,
    "ledger": {
      "_id": "507f1f77bcf86cd799439099",
      "userId": "507f1f77bcf86cd799439012",
      "type": "admin_adjustment",
      "amount": 1,
      "balanceAfter": 10,
      "purchaseId": null,
      "requestId": null,
      "metadata": {
        "adjustedBy": "admin",
        "reason": "manual_grant"
      },
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    }
  }
}
```

**Errors:** `400` invalid amount or negative result, `404` user not found

---

## Create Request For User

### `POST /admin/users/:userId/requests`

Creates a request on behalf of an existing mobile user using the same workflow as `POST /users/requests`.

**Request body:**

```json
{
  "country": "IN",
  "payload": {
    "media": {
      "obverse": ["https://media.example.com/coinzy/uploads/obverse.jpg"],
      "reverse": ["https://media.example.com/coinzy/uploads/reverse.jpg"],
      "edge": ["https://media.example.com/coinzy/uploads/edge.jpg"],
      "video": null
    }
  }
}
```

- `country` is required, normalized to uppercase, and must be one of the allowed values configured via `ALLOWED_COUNTRIES` (pipe-separated)
- `payload` defaults to `{}`
- `payload.media` is optional. When present, it follows the same validated public-URL shape as `POST /users/requests`
- invalid `payload.media` is rejected before credit is spent
- exactly one user credit is consumed
- the same request-created ledger write, allocation, lifecycle scheduling, and rollback behavior are applied as the mobile-user route
- the created request is tagged with `isAdminCreated: true` for audit purposes

**Success:** `201`
```json
{
  "error": false,
  "message": null,
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439077",
      "displayId": "EV-7K3P9Q2A",
      "coinTitle": null,
      "userId": "507f1f77bcf86cd799439012",
      "country": "IN",
      "payload": {
        "media": {
          "obverse": ["https://media.example.com/coinzy/uploads/obverse.jpg"],
          "reverse": ["https://media.example.com/coinzy/uploads/reverse.jpg"],
          "edge": ["https://media.example.com/coinzy/uploads/edge.jpg"],
          "video": null
        }
      },
      "status": "offered",
      "creditLedgerId": "507f1f77bcf86cd799439099",
      "assignedExpertId": null,
      "previousExpertIds": [],
      "internalExpertId": "507f1f77bcf86cd799439055",
      "allocationRound": 1,
      "isAdminCreated": true,
      "firstAcceptanceWindowEndsAt": "2026-06-23T00:00:00.000Z",
      "ttlExpiresAt": "2026-06-24T00:00:00.000Z",
      "deadlineAt": "2026-06-25T00:00:00.000Z",
      "acceptedAt": null,
      "submittedAt": null,
      "completedAt": null,
      "acceptedByFallback": false,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    },
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "externalUserId": "ext-001",
      "name": "Alice",
      "email": "alice@example.com",
      "creditBalance": 9,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    }
  }
}
```

- `data.user.creditBalance` is the updated post-consumption balance
- `displayId` is display-only; admin routes and allocation-summary lookups continue to use the MongoDB Request `_id`
- Request-scoped FCM tokens are never returned in API responses

**Errors:** `400` invalid body or insufficient credits, `404` user not found

---

## Allocation Scoring History

### `GET /admin/requests/:id/allocation-summary`

Shows the saved scoring snapshots for a request. This is where an admin can
check an expert's workload penalty, speed penalty, and final score. The
speed-penalty fallback defaults to 0 when no value is supplied, and can be
overridden with the `DEFAULT_SPEED_PENALTY` environment variable. The final
score defaults to `100 + workloadPenalty + speedPenalty`; configure its base
and workload/speed weights with `ALLOCATION_SCORE_BASE`,
`ALLOCATION_WORKLOAD_WEIGHT`, and `ALLOCATION_SPEED_WEIGHT`.

**Optional query parameter:**

- `stage` — one of `initial`, `first_window_expired`, or `skip_refill`

Each allocation pass is returned as a separate attempt, newest first. An
attempt includes `attemptId`, `round`, `attemptedAt`, and its ranked `summary`;
each summary row includes `expertId`, `workloadPenalty`, `speedPenalty`,
`score` (final score), `rank`, and `offered`.

**Success with `?stage=skip_refill`:**

```json
{
  "error": false,
  "message": null,
  "data": {
    "requestId": "507f1f77bcf86cd799439077",
    "stage": "skip_refill",
    "attempts": [
      {
        "attemptId": "507f1f77bcf86cd799439088",
        "round": 1,
        "attemptedAt": "2026-07-13T12:00:00.000Z",
        "summary": [
          {
            "expertId": "507f1f77bcf86cd799439055",
            "workloadPenalty": -5,
            "speedPenalty": 0,
            "score": 95,
            "rank": 1,
            "offered": true
          }
        ]
      }
    ]
  }
}
```

Without `stage`, `data.stages` groups the same attempt lists under each stage.

**Errors:** `400` unsupported stage

---

## Planned Admin Request Endpoints

The following protected endpoints are exposed for later phases and currently
return `501 Not Implemented`:

- `GET /admin/requests`
- `GET /admin/requests/:id`
- `POST /admin/requests/:id/assign`
- `POST /admin/requests/:id/mark-payment-released`
