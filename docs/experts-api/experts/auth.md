# Expert — Authentication

---

## Login

### `POST /experts/login`

Authenticates an expert and returns a JWT.

**Request body:**

```json
{
  "email": "expert@example.com",
  "password": "secret"
}
```

**Notes:** `email` is normalized to lowercase.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "token": "eyJhbGciOi...",
    "expert": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Expert One",
      "email": "expert@example.com",
      "profilePicture": null,
      "oneLineDescription": null,
      "yearsOfXp": null,
      "expertise": null,
      "isInternal": false,
      "isAvailableForRequests": true,
      "supportedCountries": ["IN"],
      "status": "active",
      "activeCommittedRequestCount": 0,
      "stats": {
        "completedCount": 0,
        "missedDeadlineCount": 0,
        "avgCompletionHoursLast5": null
      },
      "lastOfferedAt": null,
      "lastAssignedAt": null,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    }
  }
}
```

**Errors:** `400` missing fields, `401` bad credentials, `403` inactive expert account

---

## Get My Profile

### `GET /experts/me`

- Auth: expert JWT

Returns the authenticated expert's profile.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "expert": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Expert One",
      "email": "expert@example.com",
      "profilePicture": null,
      "oneLineDescription": null,
      "yearsOfXp": null,
      "expertise": null,
      "isInternal": false,
      "isAvailableForRequests": true,
      "supportedCountries": ["IN"],
      "status": "active",
      "activeCommittedRequestCount": 0,
      "stats": {
        "completedCount": 0,
        "missedDeadlineCount": 0,
        "avgCompletionHoursLast5": null
      },
      "lastOfferedAt": null,
      "lastAssignedAt": null,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    }
  }
}
```

**Notes:** backend-only fields such as `passwordHash` and `__v` are never returned.

---

## Update My Profile

### `PATCH /experts/me`

- Auth: expert JWT

This endpoint is not implemented yet and currently returns `501 Not Implemented`.

---

## Update My Availability

### `PUT /experts/me/availability`

- Auth: expert JWT

Updates whether the authenticated external expert should be considered for
future request allocation.

**Request body:**

```json
{
  "isAvailableForRequests": false
}
```

**Notes:** This only affects future allocation consideration. Existing open
offers stay visible and actionable, and already accepted work is unchanged.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "expert": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Expert One",
      "email": "expert@example.com",
      "profilePicture": null,
      "oneLineDescription": null,
      "yearsOfXp": null,
      "expertise": null,
      "isInternal": false,
      "isAvailableForRequests": false,
      "supportedCountries": ["IN"],
      "status": "active",
      "activeCommittedRequestCount": 0,
      "stats": {
        "completedCount": 0,
        "missedDeadlineCount": 0,
        "avgCompletionHoursLast5": null
      },
      "lastOfferedAt": null,
      "lastAssignedAt": null,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:05:00.000Z"
    }
  }
}
```

**Errors:** `400` missing or non-boolean `isAvailableForRequests`, `409`
internal expert availability cannot be changed
