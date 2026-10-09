# Admin — Expert Management

All endpoints in this section require the **admin API key** passed via `x-admin-key` or `x-admin-api-key` header.

Admin user operations, including delegated request creation for existing mobile users, are documented in [Users](users.md).

---

## Create Expert

### `POST /admin/experts`

Creates a new expert account.

**Request body:**

```json
{
  "name": "Expert One",
  "email": "expert@example.com",
  "password": "secret",
  "supportedCountries": ["IN"],
  "profilePicture": "https://media.example.com/avatars/expert1.jpg",
  "oneLineDescription": "Ancient coin specialist with 12 years of experience",
  "yearsOfXp": "12 years",
  "expertise": "Ancient coins"
}
```

**Notes:**
- `email` is normalized to lowercase
- `supportedCountries` values are uppercased; an empty array `[]` means the expert serves **all countries**
- `profilePicture`, `oneLineDescription`, `yearsOfXp`, and `expertise` are optional strings
- internal experts are startup-managed from env and cannot be created via admin API

**Success:** `201`
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

**Errors:** `400` invalid fields, `409` duplicate email or attempt to create an internal expert

Internal fallback coverage is bootstrapped at app startup. Admin can still
create regular experts, but the protected internal expert is automatically
reconciled from env so exactly one active internal expert exists.

---

## List Experts

### `GET /admin/experts`

Returns all experts.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "experts": [
      {
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
    ]
  }
}
```

**Notes:** backend-only fields such as `passwordHash` and `__v` are never returned in responses.

---

## Get Expert By ID

### `GET /admin/experts/:id`

Returns a single expert.

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

**Errors:** `400` invalid id, `404` expert not found

---

## Update Expert

### `PATCH /admin/experts/:id`

Updates supported fields of an expert.

**Request body:** any supported subset of:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | |
| `email` | string | |
| `password` | string | |
| `supportedCountries` | string[] | empty array `[]` means all countries |
| `profilePicture` | string | optional HTTPS avatar URL |
| `oneLineDescription` | string | optional expert self-description |
| `yearsOfXp` | string | optional years-of-experience label |
| `expertise` | string | optional expert specialization |

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "expert": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Updated Expert",
      "email": "updated@example.com",
      "profilePicture": null,
      "oneLineDescription": null,
      "yearsOfXp": "12 years",
      "expertise": "Ancient coins",
      "isInternal": false,
      "isAvailableForRequests": true,
      "supportedCountries": ["GB", "DE"],
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

Internal experts remain startup-managed for creation, but admin may update the
existing internal expert's `name`, `email`, and `password`.

**Errors:** `400` invalid id or unsupported update, `409` duplicate email, attempt to convert an external expert to internal, or attempt to convert the internal expert to external

---

## Update Expert Status

### `PATCH /admin/experts/:id/status`

Changes the expert's account status.

**Request body:**

```json
{
  "status": "active"
}
```

Allowed statuses are defined by backend constants.

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
      "status": "suspended",
      "activeCommittedRequestCount": 0,
      "stats": {
        "completedCount": 0,
        "missedDeadlineCount": 0,
        "avgCompletionHoursLast5": null
      },
      "lastOfferedAt": null,
      "lastAssignedAt": null,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:10:00.000Z"
    }
  }
}
```

**Errors:** `400` invalid id or status, `404` expert not found, `409` internal expert conflict or attempt to deactivate the internal expert

---

## Planned Expert-Country Endpoint

### `PATCH /admin/experts/:id/countries`

This protected endpoint is exposed for a later phase and currently returns
`501 Not Implemented`.
