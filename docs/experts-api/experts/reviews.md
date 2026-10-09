# Expert — Reviews & Feedback

All endpoints in this section require **expert JWT** authentication via `Authorization: Bearer <token>`.

---

## List Reviews For My Reports

### `GET /experts/me/reviews`

Returns all feedback submitted against the authenticated expert's completed reports, newest first, together with a summary of the average rating and total review count.

**Success:** `200`
```json
{
  "error": false,
  "message": null,
  "data": {
    "expertId": "507f1f77bcf86cd799439031",
    "average": 4.8,
    "count": 5,
    "reviews": [
      {
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
        "ratedAt": "2026-04-18T14:32:00.000Z",
        "hasRated": true,
        "createdAt": "2026-04-18T14:32:00.000Z",
        "updatedAt": "2026-04-18T14:32:00.000Z"
      }
    ]
  }
}
```

- `expertId` is the authenticated expert's id.
- `average` is the mean of the submitted ratings (`null` when there are no ratings yet).
- `count` is the total number of reviews across all the expert's completed reports.
- Each entry in `reviews` carries the mobile reviewer's id, the report/request ids, immutable display snapshots, the rating, sentiment, comment, platform, and timestamps.

**Errors:** none beyond authentication
