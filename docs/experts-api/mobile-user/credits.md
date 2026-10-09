# Mobile User — Credits & Payments

All endpoints in this section require **mobile-user JWT** authentication via `Authorization: Bearer <external-jwt>`.

The backend owns single-app IAP config through env. Clients must not send `appCode`, `bundleId`, `packageName`, or `productId`.

---

## Get Credit Balance

### `GET /users/me/credits`

Returns the authenticated user's current credit balance.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": { "creditBalance": 10 }
}
```

---

## Verify Apple IAP Purchase

### `POST /payments/iap/apple/verify`

Verifies an Apple App Store receipt and grants credits.

The verified product determines `creditsGranted`: configured multi-credit products grant their mapped amount, while a valid legacy product variant that has no mapping grants one credit.

Current mapped tiers are the base product (1 credit), `_3` (3 credits), and `_5` (5 credits); product IDs themselves remain server-owned configuration.

A receipt with multiple unprocessed matching consumables grants the sum of their credits. The singular `purchase` remains the newest matching transaction in that receipt.

**Request body:**

```json
{
  "receiptData": "base64-receipt"
}
```

**Idempotency:** Repeated verification of a receipt whose matching transactions are all already processed returns `creditsGranted: 0`.

The returned `purchase` is a public purchase record. It never includes the provider receipt, `purchaseToken`, or raw verification payload.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "creditBalance": 20,
    "creditsGranted": 10,
    "alreadyProcessed": false,
    "purchase": {}
  }
}
```

**Errors:** `400` missing receipt or forbidden client identifiers, `409` purchase already claimed by another user, provider/configuration errors

---

## Verify Google IAP Purchase

### `POST /payments/iap/google/verify`

Verifies a Google Play purchase token and grants credits.

The verified product determines `creditsGranted`: configured multi-credit products grant their mapped amount, while a valid legacy product variant that has no mapping grants one credit.

Current mapped tiers are the base product (1 credit), `_3` (3 credits), and `_5` (5 credits); product IDs themselves remain server-owned configuration.

**Request body:**

```json
{
  "purchaseToken": "provider-token"
}
```

**Idempotency:** Repeated verification of the same already-processed purchase returns `creditsGranted: 0`.

After a verified Google purchase grants its credit, the backend consumes it with Google immediately. Temporary consumption failures are retried internally and do not change the credited balance or response. Confirmed terminal failures are retained for support review.

The returned `purchase` is a public purchase record. It never includes the provider `purchaseToken` or raw verification payload.

**Success:**
```json
{
  "error": false,
  "message": null,
  "data": {
    "creditBalance": 20,
    "creditsGranted": 10,
    "alreadyProcessed": false,
    "purchase": {}
  }
}
```

**Errors:** `400` missing purchase token or forbidden client identifiers, `409` purchase already claimed by another user, provider/configuration errors
