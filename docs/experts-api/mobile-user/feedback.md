# Mobile User — Feedback

All endpoints in this section require **mobile-user JWT** authentication via `Authorization: Bearer <token>`.

---

## Submit Feedback

### `POST /users/feedback`

Submits a rating and optional review for a completed expert report. A mobile user may rate a given report (and its request) only once.

**Request body:**

```json
{
  "reportId": "507f1f77bcf86cd799439099",
  "rating": 5,
  "sentiment": "satisfied",
  "comment": "Excellent evaluation! Very detailed and informative.",
  "platform": "android"
}
```

- `reportId` is required and is the MongoDB Report `_id`. Look it up from the completed request's `reportId` (see `GET /users/requests/:requestId/report`).
- `rating` is required and must be an integer from `1` to `5`.
- `sentiment` is optional and must be one of `satisfied`, `neutral`, or `unsatisfied`.
- `comment` is optional, max 2000 characters.
- `platform` is optional and must be one of `android`, `ios`, or `web`.

**Validations & business rules:**
- The report must already be `submitted` (i.e. completed by the expert).
- The request must be owned by the authenticated mobile user and be `completed`.
- Only one feedback is allowed per user/request pair — a duplicate returns `409`.

The backend snapshots the request `displayId`, report `coinTitle`, and the requesting user's display name onto the feedback so the review stays immutable.

**Success:** `201`
```json
{
  "error": false,
  "message": null,
  "data": {
    "feedback": {
      "_id": "507f1f77bcf86cd799439102",
      "userId": "507f1f77bcf86cd799439012",
      "reportId": "507f1f77bcf86cd799439099",
      "requestId": "507f1f77bcf86cd799439077",
      "expertId": "507f1f77bcf86cd799439031",
      "displayId": "EV-7K3P9Q2A",
      "coinName": "Quarter Rupee Travancore",
      "reviewerDisplayName": "Mobile User",
      "rating": 5,
      "sentiment": "satisfied",
      "comment": "Excellent evaluation! Very detailed and informative.",
      "platform": "android",
      "ratedAt": "2026-06-24T14:32:00.000Z",
      "hasRated": true,
      "createdAt": "2026-06-24T14:32:00.000Z",
      "updatedAt": "2026-06-24T14:32:00.000Z"
    }
  }
}
```

**Errors:** `400` invalid `reportId`, `rating`, `sentiment`, `comment`, or `platform`; `404` report or request not found; `409` report not yet completed or feedback already submitted

---

## List My Feedback

### `GET /users/feedback/me`

Returns all feedback the authenticated mobile user has submitted, newest first. Uses the same `feedback` shape shown above.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": { "feedbacks": [] }
}
```
