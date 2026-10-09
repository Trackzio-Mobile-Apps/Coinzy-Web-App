"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import { ExpertsBreadcrumb } from "@/components/experts/ExpertsBreadcrumb";
import { submitExpertFeedback } from "@/lib/experts/client";
import type { ExpertReport, ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";
import { expertDisplayTitle, expertRequestId } from "@/lib/experts/types";

function authenticityTone(value: string | null | undefined) {
  const v = (value || "").toLowerCase();
  if (v.includes("authentic") && !v.includes("not")) return "text-[#047857] bg-[#ecfdf5]";
  if (v.includes("fake") || v.includes("counterfeit")) return "text-[#b91c1c] bg-[#fef2f2]";
  if (v.includes("doubt")) return "text-[#a16207] bg-[#fefce8]";
  return "text-ink bg-[#f5f5f5]";
}

/** Completed report — Figma other cases `1038:159962`. */
export function ExpertReportPanel({
  request,
  report,
  creditBalance,
  experts,
}: {
  request: ExpertRequest;
  report: ExpertReport;
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
}) {
  const title = report.coinTitle || expertDisplayTitle(request);
  const reportId = report._id || report.id || "";
  const fields = report.contentFields || [];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const sendFeedback = () => {
    if (!reportId || rating < 1) return;
    startTransition(async () => {
      setError("");
      const sentiment = rating >= 4 ? "satisfied" : rating === 3 ? "neutral" : "unsatisfied";
      const res = await submitExpertFeedback({
        reportId,
        rating,
        sentiment,
        comment: comment.trim() || undefined,
      });
      if (res.error) {
        setError(res.message || "Could not send feedback.");
        return;
      }
      setSent(true);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1122px] gap-4 px-8 py-6">
      <div className="min-w-0 flex-1">
        <ExpertsBreadcrumb
          crumbs={[
            { label: "Expert analysis", href: "/experts" },
            { label: title },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#e5e7eb] bg-white p-5">
          {report.authenticity ? (
            <div className={`mb-4 rounded-[10px] px-3 py-2.5 text-sm font-medium capitalize ${authenticityTone(report.authenticity)}`}>
              Verdict: {report.authenticity}
            </div>
          ) : null}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Expert report</p>
              <h1 className="mt-1 text-xl font-semibold text-ink">{title}</h1>
              {report.expertDisplayName ? (
                <p className="mt-1 text-sm text-[#737373]">Reviewed by {report.expertDisplayName}</p>
              ) : null}
            </div>
          </div>

          {fields.length > 0 ? (
            <dl className="mt-6 divide-y divide-[#f0f0f1] border-t border-[#f0f0f1]">
              {fields.map((f, i) => (
                <div key={f.key || f.label || i} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <dt className="text-[#737373]">{f.label || f.key || "Field"}</dt>
                  <dd className="max-w-[60%] text-right font-medium text-ink">
                    {f.value == null || f.value === "" ? "—" : String(f.value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-6 text-sm text-muted">Report details will appear here when available.</p>
          )}

          {report.attachments?.length ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-ink">Attachments</p>
              <ul className="mt-2 space-y-1">
                {report.attachments.map((a, i) =>
                  a.url ? (
                    <li key={a.url + i}>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:underline">
                        {a.label || a.type || "Attachment"}
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="mt-4 rounded-[12px] border border-[#e5e7eb] bg-white p-5">
          <h2 className="text-sm font-medium text-ink">Rate this report</h2>
          {sent ? (
            <p className="mt-2 text-sm text-[#047857]">Thanks for your feedback.</p>
          ) : (
            <>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} stars`}
                    onClick={() => setRating(n)}
                    className={`size-9 rounded-lg border text-sm font-medium ${
                      rating >= n ? "border-primary-500 bg-primary-50 text-primary-500" : "border-[#e5e5e5] text-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 400))}
                rows={2}
                placeholder="Optional comment"
                className="mt-3 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-primary-500"
              />
              <button
                type="button"
                disabled={pending || rating < 1 || !reportId}
                onClick={sendFeedback}
                className="mt-3 inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {pending ? "Sending…" : "Submit feedback"}
              </button>
              {error ? (
                <p role="alert" className="mt-2 text-sm text-[#b91c1c]">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </section>

        <p className="mt-4 text-sm">
          <Link href="/experts" className="text-primary-500 hover:underline">
            ← All evaluations
          </Link>
          <span className="mx-2 text-muted">·</span>
          <Link href={`/experts/request/${expertRequestId(request)}`} className="text-primary-500 hover:underline">
            Status
          </Link>
        </p>
      </div>
      <ExpertsAside creditBalance={creditBalance} experts={experts} />
    </div>
  );
}
