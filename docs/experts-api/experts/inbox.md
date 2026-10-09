# Expert — Inbox

All endpoints require expert JWT authentication via `Authorization: Bearer <token>`.

## List My Inbox

### `GET /experts/me/inbox`

Returns every retained inbox item for the authenticated expert, newest first.
Fetching does not change `isShown` or `isRead`.

Only actionable `request.offered` and `request.deadline_missed` events are retained.
An offer inbox item changes to `isActive: false` once the offer is no longer
actionable, including withdrawal, acceptance, skipping, or expiry.
The backend keeps the newest `EXPERT_INBOX_SIZE` records per
expert (default `50`).

**Success:**

```json
{
  "error": false,
  "message": null,
  "data": {
    "inbox": [
      {
        "_id": "507f1f77bcf86cd799439051",
        "event": "request.offered",
        "payload": {
          "offerId": "507f1f77bcf86cd799439041",
          "requestId": "507f1f77bcf86cd799439077",
          "round": 1,
          "expiresAt": "2026-06-24T00:00:00.000Z"
        },
        "requestId": "507f1f77bcf86cd799439077",
        "offerId": "507f1f77bcf86cd799439041",
        "isShown": false,
        "isRead": false,
        "isActive": true,
        "createdAt": "2026-06-22T00:00:00.000Z",
        "updatedAt": "2026-06-22T00:00:00.000Z"
      }
    ]
  }
}
```

## Update Inbox Item State

### `PATCH /experts/me/inbox/:inboxItemId`

Provide one or both independent boolean fields:

```json
{ "isShown": true, "isRead": false }
```

The inbox item must belong to the authenticated expert. Errors: `400` when
no valid state field is supplied, `404` when the inbox item is absent or not owned.

**Success:**

```json
{
  "error": false,
  "message": null,
  "data": {
    "inboxItem": {
      "_id": "507f1f77bcf86cd799439051",
      "event": "request.offered",
      "payload": {
        "offerId": "507f1f77bcf86cd799439041",
        "requestId": "507f1f77bcf86cd799439077",
        "round": 1,
        "expiresAt": "2026-06-24T00:00:00.000Z"
      },
      "requestId": "507f1f77bcf86cd799439077",
      "offerId": "507f1f77bcf86cd799439041",
      "isShown": true,
      "isRead": false,
      "isActive": true,
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:05:00.000Z"
    }
  }
}
```
