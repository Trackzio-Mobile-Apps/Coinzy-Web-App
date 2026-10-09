# Coinzy Experts API — local mirror

Source: [https://coinzy-experts-api.trackzio.com/docs/#/README](https://coinzy-experts-api.trackzio.com/docs/#/README) (Docsify).

Synced from live docs on **9 Oct 2026**. Open `overview.md` or the files below.

| Section | File |
| --- | --- |
| Overview / auth / RTN | `overview.md` |
| Allocation | `allocation.md` |
| Manual smoke | `manual-smoke-flow.md` |
| Mobile profile + expert directory | `mobile-user/profile.md` |
| Credits + IAP verify | `mobile-user/credits.md` |
| Requests + uploads + report | `mobile-user/requests.md` |
| Feedback | `mobile-user/feedback.md` |
| Expert / Admin modules | `experts/*`, `admin/*` |

**Base URL (Android `EXPERTS_BASE_URL`):** `https://coinzy-experts-api.trackzio.com/`  
**QA:** `https://api.coinzy-experts-qa.trackzio.com/`

Envelope: `{ error, message, data }`. Mobile auth: `Authorization: Bearer <external-jwt>` (verified with `USER_JWT_SHARED_SECRET`). Production Android sends the same Coinzy coins-API session JWT via `TokenInterceptor`.

## Mobile user endpoints (web-relevant)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/users/me` | Experts profile + creditBalance |
| `GET` | `/users/me/credits` | Credit balance |
| `GET` | `/users/experts` | Expert directory (`country`, `available`, `includeInternal`) |
| `POST` | `/users/uploads` | Multipart media → public HTTPS URLs (docs path; S3) |
| `POST` | `/users/requests` | Create request (1 credit); optional `x-fcm-token` |
| `GET` | `/users/requests` | List my requests |
| `GET` | `/users/requests/:id` | Request by Mongo `_id` |
| `POST` | `/users/requests/:id/retry` | Retry `deadline_missed` |
| `GET` | `/users/requests/:requestId/report` | Submitted report (`contentFields`) |
| `POST` | `/users/feedback` | Rate report |
| `POST` | `/payments/iap/apple/verify` | Apple IAP |
| `POST` | `/payments/iap/google/verify` | Google Play IAP |

Realtime: Socket.IO rooms `user:{userId}` — events `request.accepted`, `request.deadline_missed`, `request.retry_started`, `report.submitted`, `credit.updated`, …

## Android mobile flow (copy this on web)

Screens (`presentation/screens/experts` + `Screen.kt`):

1. **Entry** — Home banner / Identify coin CTA / sidebar “Expert analysis”
2. **Upload photos** (`ExpertUploadPhotosScreen`) — slots **obverse / reverse / edge** (1–2 each) + optional **video** (≤10s, ≤1080p)
3. **Uploaded media review** (`ExpertUploadedMediaScreen`)
4. **Credits / IAP gate** — SKUs `coinzy_expert_token` (1), `_3` (3), `_5` (5) → `POST …/google/verify` (or Apple)
5. **Create request** — `POST /users/requests` with `{ country, payload: { media, notes? } }` after media URLs exist
6. **Status** (`ExpertEvaluationStatusScreen`) — poll + Socket/FCM; states offered → accepted → completed / deadline_missed → retry
7. **History list** (`ExpertEvaluationsListScreen`)
8. **Report** (`ExpertEvaluationReportScreen`) — structured `contentFields` + attachments; PDF optional
9. **Feedback** — `POST /users/feedback` with `reportId`, `rating`, `sentiment`

**Media note:** Docs prescribe `POST /users/uploads` (S3). Current Android still uploads to **Firebase Storage** then passes download URLs into `payload.media`. Web should prefer **`POST /users/uploads`** unless product wants Firebase parity.

## Figma (Copy file)

File key: `5hhBNjumI3EaALlyW6ySXa` (Coinzy-webapp--Copy-)

| Area | Node |
| --- | --- |
| Expert evaluation / New user | `1049:167922` |
| Progress strip (upload → …) | `1045:166649` |
| Other cases (report received, authentic/fake/doubtful) | `1038:159962` |
| Related | `1327:206087` |
| **Feed / Community (updated)** | `951:87324` |
