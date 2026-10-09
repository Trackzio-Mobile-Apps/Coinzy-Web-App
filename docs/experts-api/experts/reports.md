# Expert — Reports

All endpoints in this section require **expert JWT** authentication via `Authorization: Bearer <token>`.

---

## List Reports

### `GET /experts/reports`

Returns every report owned by the authenticated expert, including drafts and submitted reports.

List rows are intentionally lean so the expert dashboard can resume Drafts / Continue by matching `report.requestId` to an accepted request `_id`, then loading fields from `GET /experts/reports/:id`.

- Auth: expert JWT
- Scoped to `expertId` on the JWT; other experts' reports are never returned
- `requestId` is the MongoDB Request `_id`, never `displayId`
- Drafts are sorted before submitted rows so `Array.find(report.requestId === request._id)` prefers a draft when both exist
- List items omit `contentFields` and attachments
- An expert with no reports receives `200` and `reports: []`, not `404`

**Success:** `200`
```json
{
  "error": false,
  "message": null,
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439099",
        "requestId": "507f1f77bcf86cd799439077",
        "isDraft": true,
        "status": "draft"
      }
    ]
  }
}
```

---

## Submit Report

### `POST /experts/reports`

Submits a report for an accepted request.

**Request body:**

```json
{
  "requestId": "request-object-id",
  "contentFields": {
    "generalInfo": {
      "coinName": "Quarter Rupee Travancore",
      "currencyAndDenomination": "INR 0.25",
      "issuer": "Travancore",
      "period": "1800-1900",
      "rulerOrGovt": "Travancore Kingdom",
      "yearOfMinting": "1880",
      "mintLocation": "Trivandrum"
    },
    "physicalSpecs": {
      "material": "Silver",
      "weight": "2.8g",
      "dominantColor": "Silver",
      "mintingMethod": "Machine struck"
    },
    "designDetails": {
      "obverseDescription": "Conch shell motif",
      "reverseDescription": "Tamil script legend",
      "history": "Rare Travancore issue"
    },
    "valueAndRarity": {
      "rarity": "Scarce",
      "currency": "INR",
      "estimatedPriceRange": "₹5,000 – ₹15,000"
    },
    "expertAssessment": {
      "authenticity": "Authentic",
      "conditionOrGrade": "Very Fine",
      "errorsOrSpecialFeatures": "Double strike on reverse",
      "recommendation": "Hold"
    }
  },
  "attachments": [],
  "isDraft": true
}
```

- `isDraft` defaults to `true`; drafts keep the request accepted and do not notify the mobile user or admin.
- Set `isDraft` to `false` to submit the report, complete the request, and emit `report.submitted`.
- Only the currently assigned expert can submit
- Only accepted requests can be completed
- `contentFields.generalInfo.coinName` is the canonical required report title. The backend derives top-level response `coinTitle` and copies it to the completed request for mobile evaluation cards
- When the report is submitted, the returned request includes `reportId` pointing to the created report; before submission it remains `null`
- `requestId` must be the MongoDB Request `_id`; the display-only evaluation ID is not accepted
- `contentFields` is the structured appraisal payload (all fields within it are optional for drafts; when finalising with `isDraft: false`, 16 mandatory fields must be populated — see below)
- **Mandatory field validation** — when submitting (`isDraft: false`), the report save fails unless these `contentFields` are all non-empty: `coinName`, `currencyAndDenomination`, `issuer`, `period`, `rulerOrGovt`, `yearOfMinting`, `mintLocation`, `material`, `obverseDescription`, `reverseDescription`, `rarity`, `currency`, `estimatedPriceRange`, `authenticity`, `conditionOrGrade`, `recommendation`

**Success:** `201`
```json
{
  "error": false,
  "message": null,
  "data": {
    "report": {
      "_id": "507f1f77bcf86cd799439099",
      "requestId": "507f1f77bcf86cd799439077",
      "requestDisplayId": "EV-7K3P9Q2A",
      "expertId": "507f1f77bcf86cd799439031",
      "userId": "507f1f77bcf86cd799439012",
      "coinTitle": "Quarter Rupee Travancore",
      "contentFields": {
        "generalInfo": {
          "coinName": "Quarter Rupee Travancore",
          "currencyAndDenomination": "INR 0.25",
          "issuer": "Travancore",
          "period": "1800-1900",
          "rulerOrGovt": "Travancore Kingdom",
          "yearOfMinting": "1880",
          "mintLocation": "Trivandrum"
        },
        "physicalSpecs": {
          "material": "Silver",
          "weight": "2.8g",
          "dominantColor": "Silver",
          "mintingMethod": "Machine struck"
        },
        "designDetails": {
          "obverseDescription": "Conch shell motif",
          "reverseDescription": "Tamil script legend",
          "history": "Rare Travancore issue"
        },
        "valueAndRarity": {
          "rarity": "Scarce",
          "currency": "INR",
          "estimatedPriceRange": "INR 5,000 - INR 15,000"
        },
        "expertAssessment": {
          "authenticity": "Authentic",
          "conditionOrGrade": "Very Fine",
          "errorsOrSpecialFeatures": "Double strike on reverse",
          "recommendation": "Hold"
        }
      },
      "attachments": [],
      "isDraft": false,
      "status": "submitted",
      "submittedAt": "2026-06-24T12:00:00.000Z"
    },
    "request": {
      "_id": "507f1f77bcf86cd799439077",
      "displayId": "EV-7K3P9Q2A",
      "coinTitle": "Quarter Rupee Travancore",
      "country": "IN",
      "payload": {},
      "status": "completed",
      "assignedExpertId": "507f1f77bcf86cd799439031",
      "reportId": "507f1f77bcf86cd799439099",
      "deadlineAt": "2026-06-25T00:00:00.000Z",
      "acceptedAt": "2026-06-22T00:15:00.000Z",
      "submittedAt": "2026-06-24T12:00:00.000Z",
      "completedAt": "2026-06-24T12:00:00.000Z",
      "createdAt": "2026-06-22T00:00:00.000Z",
      "updatedAt": "2026-06-24T12:00:00.000Z",
      "firstAcceptanceWindowEndsAt": "2026-06-23T00:00:00.000Z",
      "ttlExpiresAt": "2026-06-24T00:00:00.000Z"
    }
  }
}
```

`requestDisplayId` is an immutable display snapshot copied from the Request. It is not indexed or accepted for report/request lookup; `requestId` remains canonical. Legacy reports may return `requestDisplayId: null`.

Every report response, including mobile `GET /users/requests/:requestId/report`, returns this same `contentFields` structure and never returns legacy top-level `content`.

**Errors:** `400` invalid request id, missing canonical title, deprecated `content`, or bad attachments; `403` wrong expert; `404` request not found; `409` request not submittable or report already exists

---

## Update Draft Report

### `PUT /experts/reports/:id`

Updates an expert-owned draft. The body may include `contentFields`, `attachments`, and `isDraft`.

Setting `isDraft` to `false` submits the report and completes its request. Submitted reports cannot be edited.

**Success:** `200`, `data: { report }` for a draft save, or `data: { report, request }` when submitted.

---

## Get Report By ID

### `GET /experts/reports/:id`

Returns only the authenticated expert's own report.

**Success:**
```json
{ "error": false, "data": { "report": {} } }
```

**Errors:** `404` report not found
