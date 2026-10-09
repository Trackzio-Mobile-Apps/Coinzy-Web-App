"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import { ExpertsBreadcrumb } from "@/components/experts/ExpertsBreadcrumb";
import { getExpertRequest, retryExpertRequest } from "@/lib/experts/client";
import {
  expertDisplayTitle,
  expertRequestId,
  type ExpertRequest,
  type ExpertsDirectoryItem,
} from "@/lib/experts/types";

/**
 * Status / deadline / in-progress — poll like Android; `POST …/retry` on
 * `deadline_missed` (Figma extend deadline `1327:206087`).
 */
export function ExpertStatusPanel({
  initial,
  creditBalance,
  experts,
}: {
  initial: ExpertRequest;
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
}) {
  const router = useRouter();
  const [request, setRequest] = useState(initial);
  const [error, setError] = useState("");
  const [extendOpen, setExtendOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const id = expertRequestId(request);
  const status = (request.status || "").toLowerCase();

  useEffect(() => {
    if (status === "completed") {
      router.replace(`/experts/request/${id}/report`);
      return;
    }
    if (status !== "offered" && status !== "accepted") return;
    const t = setInterval(() => {
      void getExpertRequest(id).then((res) => {
        if (!res.error && res.data?.request) {
          setRequest(res.data.request);
          const s = (res.data.request.status || "").toLowerCase();
          if (s === "completed") {
            router.replace(`/experts/request/${id}/report`);
          }
        }
      });
    }, 12000);
    return () => clearInterval(t);
  }, [id, status, router]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (extendOpen && !el.open) el.showModal();
    if (!extendOpen && el.open) el.close();
  }, [extendOpen]);

  const runRetry = () => {
    startTransition(async () => {
      setError("");
      const res = await retryExpertRequest(id);
      if (res.error || !res.data?.request) {
        setError(res.message || "Could not extend / retry.");
        setExtendOpen(false);
        return;
      }
      setRequest(res.data.request);
      setExtendOpen(false);
    });
  };

  const title = expertDisplayTitle(request);
  const media = request.payload?.media;
  const photos = [...(media?.obverse || []), ...(media?.reverse || []), ...(media?.edge || [])];
  const hoursLeft = hoursUntil(request.deadlineAt);
  const missed = status === "deadline_missed";
  const cancelled = status === "cancelled";

  return (
    <div className="mx-auto flex w-full max-w-[1122px] gap-4 px-8 py-6">
      <div className="min-w-0 flex-1">
        <ExpertsBreadcrumb
          crumbs={[
            { label: "Expert analysis", href: "/experts" },
            { label: request.displayId || title },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#e5e7eb] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ink">
                {missed || cancelled
                  ? "Your evaluation could not be completed"
                  : status === "offered"
                    ? "Finding an expert…"
                    : "Evaluation in progress"}
              </h1>
              <p className="mt-1 text-sm text-[#737373]">
                {request.displayId || id}
                {request.deadlineAt ? ` · Deadline ${formatWhen(request.deadlineAt)}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={status} />
              {hoursLeft != null && !missed && !cancelled ? (
                <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#1d4ed8]">
                  {hoursLeft <= 0 ? "Due soon" : `~${hoursLeft}h left`}
                </span>
              ) : null}
              {(missed || cancelled) && (
                <span className="rounded-full bg-[#fef2f2] px-2.5 py-1 text-xs font-medium text-[#b91c1c]">
                  Est. time: Overdue
                </span>
              )}
            </div>
          </div>

          {photos.length > 0 || media?.video ? (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {photos.slice(0, 6).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="size-16 rounded-lg object-cover" />
                ))}
                {media?.video ? (
                  <div className="flex size-16 items-center justify-center rounded-lg bg-[#f5f5f5] text-[10px] text-muted">
                    Video
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-[#737373]">
                {photos.length} photo{photos.length === 1 ? "" : "s"}
                {media?.video ? " / 1 video" : ""} submitted
              </p>
            </div>
          ) : null}

          <ProgressSteps status={status} createdAt={request.createdAt} acceptedAt={request.acceptedAt} />

          {status === "offered" && (
            <p className="mt-4 text-sm leading-5 text-[#49494b]">
              We&apos;re matching your coin with an available expert. This usually takes a few minutes.
            </p>
          )}
          {status === "accepted" && (
            <p className="mt-4 text-sm leading-5 text-[#49494b]">
              An expert is reviewing your photos. You&apos;ll get a notification when the report is ready
              (typically within 72 hours).
            </p>
          )}

          {missed && (
            <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-4">
              <p className="font-medium text-[#991b1b]">Deadline exceeded</p>
              <p className="mt-1 text-sm text-[#7f1d1d]">
                No expert finished in time. Retry starts a fresh allocation (same as the app). Credits
                follow the Experts API — usually not charged again for a pure retry.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setExtendOpen(true)}
                  className="inline-flex h-9 items-center rounded-[10px] border border-primary-500 bg-white px-4 text-sm font-medium text-primary-500 disabled:opacity-50"
                >
                  Extend evaluation time
                </button>
                <Link
                  href="/experts/new"
                  className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Book new evaluation
                </Link>
              </div>
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-3 text-sm text-[#b91c1c]">
              {error}
            </p>
          ) : null}

          <p className="mt-6 rounded-[10px] border border-[#c2dcff] bg-[#f2f7ff] px-3 py-2.5 text-xs leading-4 text-[#193cb8]">
            You&apos;ll receive a notification when your evaluation updates.{" "}
            <Link href="/experts" className="font-medium underline-offset-2 hover:underline">
              Back to Expert analysis
            </Link>
          </p>
        </section>
      </div>
      <ExpertsAside creditBalance={creditBalance} experts={experts} />

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(100%,532px)] rounded-[12px] border-0 bg-white p-0 shadow-xl backdrop:bg-black/40"
        onClose={() => setExtendOpen(false)}
        aria-labelledby={titleId}
      >
        <div className="px-4 pt-4">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Give your expert more time?
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#737373]">
            Retry restarts allocation for this request (Android `POST …/retry`). The new deadline is set by
            the Experts API — no separate web purchase required.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-[#f0f0f1] px-4 py-4">
          <button
            type="button"
            className="h-8 rounded-[8px] px-3 text-sm font-medium text-[#737373] hover:bg-[#f5f5f5]"
            onClick={() => setExtendOpen(false)}
          >
            Not now
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={runRetry}
            className="h-8 rounded-[8px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Extending…" : "Extend deadline"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function ProgressSteps({
  status,
  createdAt,
  acceptedAt,
}: {
  status: string;
  createdAt?: string | null;
  acceptedAt?: string | null;
}) {
  const assigned = status === "accepted" || status === "completed";
  const failed = status === "deadline_missed" || status === "cancelled";
  const reportReady = status === "completed";

  const steps: { label: string; state: "done" | "active" | "pending" | "failed"; detail?: string }[] = [
    {
      label: "Coin uploaded",
      state: "done",
      detail: createdAt ? formatWhen(createdAt) : undefined,
    },
    {
      label: failed && !assigned ? "Evaluation status" : "Expert assigned",
      state: failed && !assigned ? "failed" : assigned ? "done" : status === "offered" ? "active" : "pending",
      detail: acceptedAt ? formatWhen(acceptedAt) : status === "offered" ? "Matching…" : undefined,
    },
    {
      label: "Report ready",
      state: reportReady ? "done" : failed ? "failed" : assigned ? "active" : "pending",
    },
  ];

  return (
    <ol className="mt-6 space-y-3 border-t border-[#f0f0f1] pt-5">
      {steps.map((s) => (
        <li key={s.label} className="flex items-start gap-3">
          <StepDot state={s.state} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{s.label}</p>
              <span
                className={`text-xs font-medium ${
                  s.state === "done"
                    ? "text-[#047857]"
                    : s.state === "failed"
                      ? "text-[#b91c1c]"
                      : s.state === "active"
                        ? "text-[#c2410c]"
                        : "text-[#a3a3a3]"
                }`}
              >
                {s.state === "done" ? "Completed" : s.state === "failed" ? "Cancelled" : s.state === "active" ? "In progress" : "Pending"}
              </span>
            </div>
            {s.detail ? <p className="mt-0.5 text-xs text-[#737373]">{s.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StepDot({ state }: { state: "done" | "active" | "pending" | "failed" }) {
  const cls =
    state === "done"
      ? "bg-[#00c950] text-white"
      : state === "failed"
        ? "bg-[#d13425] text-white"
        : state === "active"
          ? "bg-[#c48a8d] text-white"
          : "bg-[#dfdfe0] text-transparent";
  return (
    <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${cls}`}>
      {state === "done" ? "✓" : state === "failed" ? "×" : state === "active" ? "…" : ""}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    offered: { label: "Review pending", className: "bg-[#f3f5f7] text-[#6a7282]" },
    accepted: { label: "In progress", className: "bg-[#ffedd4] text-[#ca3500]" },
    completed: { label: "Completed", className: "bg-[#dcfce7] text-[#0d542b]" },
    deadline_missed: { label: "Deadline missed", className: "bg-[#ffd5d4] text-[#660901]" },
    cancelled: { label: "Cancelled", className: "bg-[#ffd5d4] text-[#660901]" },
  };
  const m = map[status] || { label: status || "Pending", className: "bg-[#f5f5f5] text-[#525252]" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${m.className}`}>{m.label}</span>;
}

function formatWhen(iso: string) {
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function hoursUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 3_600_000);
}
