# Allocation Flow

This page explains the request allocation lifecycle in plain English.

## Main Timing Inputs

- `FIRST_ACCEPTANCE_WINDOW_HOURS`: how long the first external pool has before second-pool expansion can begin
- `REQUEST_TTL_HOURS`: total time before the internal-expert fallback can auto-accept an unclaimed request
- `REQUEST_DEADLINE_HOURS`: total time allowed to complete the request
- `FIRST_POOL_SIZE`: max number of external experts offered in round 1
- `SECOND_POOL_SIZE`: max number of additional external experts offered after the first window expires
- `MAX_ACTIVE_COMMITTED_REQUESTS`: global cap for how many accepted in-flight requests an expert can carry
- `INTERNAL_EXPERT_EMAIL`, `INTERNAL_EXPERT_NAME`, `INTERNAL_EXPERT_PASSWORD`: internal-expert fallback identity
- `ALLOWED_COUNTRIES`: allowed request countries and expert supported-country values

## Scoring Inputs

The eligible external experts are ranked using:

```text
score = ALLOCATION_SCORE_BASE
  + (workload penalty × ALLOCATION_WORKLOAD_WEIGHT)
  + (speed penalty × ALLOCATION_SPEED_WEIGHT)
```

- `ALLOCATION_WORKLOAD_PENALTY_SLABS` and `ALLOCATION_SPEED_PENALTY_SLABS` are
  JSON arrays of ordered slabs. A slab's `lt` value is its exclusive upper
  bound; the final slab has no `lt` and is the catch-all.
- Speed values are in hours, and may be decimal values: `0.2` means 12 minutes.
- `DEFAULT_SPEED_PENALTY` applies when an expert has no completion-speed history.
- Set either weight to `0` to exclude that factor from the score. Weights cannot
  be negative.

See `.env.sample` for the default slabs and deployment-ready syntax.

When final scores are equal, tie-breakers apply in this order: least recently
offered, lower active workload, faster completion average, least recently
assigned, then random selection. Experts who have never received an external
offer rank ahead of experts who have at the offer-exposure step.

## QA Allocation View

Run `npm run db:ensure-allocation-attempt-summary-view` during deployment to
create or update the `allocation_attempt_summaries` MongoDB view. It condenses
each request/allocation-attempt pair into one document with `requestId`,
`displayId`, stage, round, and timestamps at the top level. Its `allocations`
array is sorted by ascending final rank and includes each expert's offer flag,
scoring inputs, tie-breaker values, penalties, and final score.

## Step By Step

### 1. User creates a request

When `POST /users/requests` or `POST /admin/users/:userId/requests` succeeds, the
backend creates a request with these timestamps immediately:

- `firstAcceptanceWindowEndsAt = now + FIRST_ACCEPTANCE_WINDOW_HOURS`
- `ttlExpiresAt = now + REQUEST_TTL_HOURS`
- `deadlineAt = now + REQUEST_DEADLINE_HOURS`

Important: `deadlineAt` starts from request creation time, not from when an
expert accepts the work.

### 2. First-round allocation starts

The backend loads currently eligible **external** experts for the request:

- must be active
- must support the request country (or have an empty `supportedCountries` array, which means all countries)
- must not be internal
- must not already be excluded through `previousExpertIds`
- must be below `MAX_ACTIVE_COMMITTED_REQUESTS`

Those experts are scored and sorted. The top `FIRST_POOL_SIZE` external experts
are offered the request, plus the internal expert is also offered for fallback
continuity.

If fewer than `FIRST_POOL_SIZE` external experts are eligible, the backend
offers only the ones that exist. The pool size is a cap, not a minimum.

### 3. Experts can skip or accept

If an expert skips:

- that offer becomes `skipped`
- the backend immediately tries to offer the request to the next highest-ranked
  eligible external expert who has not already been offered that request
- this immediate refill does **not** change the existing timer-based round/TTL
  lifecycle

If no eligible external expert remains, the skip still succeeds and the request
continues with its current timers unchanged.

If an expert accepts:

- the request becomes `accepted`
- sibling open offers are withdrawn
- `acceptedAt` is stored for history/reporting

Important: acceptance does **not** extend or reset `deadlineAt`.

### 4. First-window expansion may happen later

When `firstAcceptanceWindowEndsAt` passes and the request is still unassigned:

- the backend looks for the next remaining eligible external experts
- it offers up to `SECOND_POOL_SIZE` additional external experts
- any first-pool experts who still have open offers continue to keep those
  offers; second-pool expansion adds more visible offers rather than replacing
  the first pool
- it marks the request as round 2

If fewer than `SECOND_POOL_SIZE` experts remain, it offers fewer. If none
remain, this step safely no-ops.

### 5. TTL fallback may happen later

When `ttlExpiresAt` passes and the request is still unassigned:

- the internal expert is auto-assigned
- the request becomes `accepted`
- open external offers are withdrawn

This is the last automatic fallback for an unaccepted request.

### 6. Deadline enforcement is separate from acceptance

Once a request is accepted, the deadline-miss job checks `deadlineAt`.

If the current time is past `deadlineAt` before the report is submitted:

- the request becomes `deadline_missed`
- the assigned expert is added to `previousExpertIds`
- any remaining open offers are withdrawn

The check uses the stored request deadline, not the acceptance timestamp.

### 7. Retry starts a fresh lifecycle

When a deadline-missed request is retried:

- `firstAcceptanceWindowEndsAt`, `ttlExpiresAt`, and `deadlineAt` are all
  recalculated from the retry start time
- `previousExpertIds` stays preserved
- open offers from the missed attempt are closed
- allocation starts again

So the deadline is anchored to:

- original request creation for the first attempt
- retry start time for a retry attempt

It is never anchored to expert acceptance time.
