# Manual Smoke Flow

1. Start MongoDB, Redis, and the API server.
2. Confirm startup has seeded one active internal expert from the configured env values.
3. Create several normal experts through `POST /admin/experts`.
4. Create a mobile user. The admin API has no user-creation endpoint yet, so seed one via `mongosh` or a temporary script:

   ```javascript
   // mongosh
   db.users.insertOne({
     externalUserId: "smoke-test-user",
     name: "Smoke Tester",
     email: "smoke@example.com",
     creditBalance: 0,
     createdAt: new Date(),
     updatedAt: new Date(),
   })
   ```

   Note the returned `_id` — you'll need it as `:userId` in the admin steps below.
5. Add user credit through `POST /admin/users/:userId/credits/adjust`.

   **Open RTN listener for the mobile user** (separate terminal):
   ```sh
   node scripts/listen-user.js <userId>
   ```
6. Create a request on the user's behalf with `POST /admin/users/:userId/requests`.
   - **RTN check**: user listener prints `request.offered` with `{ requestId, offerCount }`
7. Confirm the request moves into offered state via `GET /admin/experts` or a DB query.
8. **Open RTN listener for an expert** (another separate terminal):
   ```sh
   node scripts/listen-expert.js <expertId>
   ```
9. Confirm the expert sees the offer in `GET /experts/me/offers`.
10. Accept the offer with `POST /experts/offers/:offerId/accept`.
    - **RTN check**: user listener prints `request.accepted`; expert listener also prints `request.accepted`; other experts' listeners (if any) print `request.withdrawn`
11. Confirm sibling offers are withdrawn.
12. Submit the report with `POST /experts/reports` and `isDraft: false`.
    - **RTN check**: user listener prints `report.submitted` with `{ requestId, reportId }`
13. Confirm the user can read it with `GET /users/requests/:requestId/report` (requires a user JWT — generate one manually using USER_JWT_SHARED_SECRET).
14. Re-run with short lifecycle env values to force a deadline miss.
    - **RTN check**: user and expert listeners print `request.deadline_missed`
15. Retry the missed request with `POST /users/requests/:id/retry`.
16. If an offline refund request is approved, process the store refund outside this app and then restore credits with `POST /admin/users/:userId/credits/adjust`.
17. Confirm credit ledgers, user balances, and expert workload counters changed exactly once where expected.
18. Stop any running listener scripts with `Ctrl+C`.

> **Note:** The RTN listener scripts (`scripts/listen-user.js`, `scripts/listen-expert.js`) are purely diagnostic — they connect via Socket.IO and print all realtime notifications for the given actor. No user-level API calls are needed to verify notifications; the admin endpoints drive the entire lifecycle.
