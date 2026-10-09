# Mobile User — Profile

All endpoints in this section require **mobile-user JWT** authentication via `Authorization: Bearer <external-jwt>`.

---

## Get My Profile

### `GET /users/me`

Returns the authenticated user's safe persisted fields (not the raw JWT payload
or backend-only fields such as `__v`).

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "externalUserId": "mobile-user-1",
      "name": "Mobile User",
      "email": "user@example.com",
      "creditBalance": 42,
      "createdAt": "2026-06-11T00:00:00.000Z",
      "updatedAt": "2026-06-11T01:00:00.000Z"
    }
  }
}
```

---

## List Experts

### `GET /users/experts`

Returns active experts. The internal fallback expert is hidden unless
explicitly requested.

Optional query parameters:

| Parameter | Values | Behavior |
| --- | --- | --- |
| `country` | Country code, e.g. `IN` | Includes experts serving that country and experts whose empty `supportedCountries` list means all countries. |
| `available` | `true` or `false` | Filters by the expert's current request availability. |
| `includeInternal` | `true` or `false` | Includes the internal fallback expert when `true`; defaults to `false`. |

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "experts": [
      {
        "_id": "507f1f77bcf86cd799439099",
        "name": "Expert One",
        "profilePicture": null,
        "oneLineDescription": null,
        "yearsOfXp": "12 years",
        "expertise": "Ancient coins",
        "isAvailableForRequests": true,
        "supportedCountries": ["IN"],
        "stats": {
          "completedCount": 3,
          "avgCompletionHoursLast5": 6
        }
      }
    ]
  }
}
```

**Errors:** `400` invalid `available` value
