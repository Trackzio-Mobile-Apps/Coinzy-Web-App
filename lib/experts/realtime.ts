/**
 * Experts Socket.IO — Android `ExpertsSocketManager` / `ExpertsFcmMessage` parity.
 * REST remains source of truth; socket events only trigger data refresh.
 */

export const EXPERTS_USER_EVENTS = [
  "request.accepted",
  "request.withdrawn",
  "request.deadline_missed",
  "request.retry_started",
  "report.submitted",
  "credit.updated",
] as const;

export type ExpertsUserEvent = (typeof EXPERTS_USER_EVENTS)[number];

export type ExpertsRealtimeMessage = {
  event: ExpertsUserEvent;
  requestId?: string;
  reportId?: string;
  creditBalance?: number;
  expertId?: string;
  offerId?: string;
};

const REQUEST_LIFECYCLE: ReadonlySet<string> = new Set([
  "request.accepted",
  "request.withdrawn",
  "request.deadline_missed",
  "request.retry_started",
  "report.submitted",
]);

export function isExpertsUserEvent(event: string): event is ExpertsUserEvent {
  return (EXPERTS_USER_EVENTS as readonly string[]).includes(event);
}

export function isRequestLifecycleEvent(event: string): boolean {
  return REQUEST_LIFECYCLE.has(event);
}

/** Parse Socket.IO / FCM-shaped payload (Android `ExpertsFcmMessage.fromData`). */
export function parseExpertsRealtimePayload(
  event: string,
  raw: unknown,
): ExpertsRealtimeMessage | null {
  if (!isExpertsUserEvent(event)) return null;

  let obj: Record<string, unknown> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        obj = parsed as Record<string, unknown>;
      }
    } catch {
      /* ignore */
    }
  }

  const nested =
    obj.payload && typeof obj.payload === "object" && !Array.isArray(obj.payload)
      ? (obj.payload as Record<string, unknown>)
      : typeof obj.payload === "string"
        ? (() => {
            try {
              return JSON.parse(obj.payload) as Record<string, unknown>;
            } catch {
              return {};
            }
          })()
        : {};

  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const v = obj[key] ?? nested[key];
      if (v != null && v !== "") return String(v);
    }
    return undefined;
  };

  const requestNested =
    (obj.request && typeof obj.request === "object" ? obj.request : null) ||
    (nested.request && typeof nested.request === "object" ? nested.request : null);
  const fromRequest =
    requestNested && typeof requestNested === "object"
      ? String(
          (requestNested as { id?: string; _id?: string; requestId?: string }).requestId ||
            (requestNested as { id?: string }).id ||
            (requestNested as { _id?: string })._id ||
            "",
        ) || undefined
      : undefined;

  const creditRaw = obj.creditBalance ?? nested.creditBalance;
  const creditBalance =
    typeof creditRaw === "number"
      ? creditRaw
      : typeof creditRaw === "string" && creditRaw.trim() !== "" && !Number.isNaN(Number(creditRaw))
        ? Number(creditRaw)
        : undefined;

  return {
    event,
    requestId: pick("requestId", "request_id") || fromRequest,
    reportId: pick("reportId", "report_id"),
    expertId: pick("expertId", "expert_id"),
    offerId: pick("offerId", "offer_id"),
    creditBalance,
  };
}

export type ExpertsSocketConfig = {
  url: string;
  userId: string;
};
