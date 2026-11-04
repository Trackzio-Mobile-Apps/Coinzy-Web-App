"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ReportReadyView } from "@/components/experts/ReportReadyView";
import { creditBalanceFromData, parseCreditBalance } from "@/lib/experts/creditBalance";
import { getExpertsCredits, submitExpertFeedback } from "@/lib/experts/client";
import type { ExpertsRealtimeMessage } from "@/lib/experts/realtime";
import { useExpertsRealtime } from "@/lib/experts/useExpertsRealtime";
import type { ExpertReport, ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";

/** Completed report — Figma other cases `1038:159962`. */
export function ExpertReportPanel({
  request,
  report,
  creditBalance: initialCredits,
  experts,
  preview = false,
}: {
  request: ExpertRequest;
  report: ExpertReport;
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
  preview?: boolean;
}) {
  const reportId = report._id || report.id || "";
  const [credits, setCredits] = useState(initialCredits);
  useEffect(() => {
    if (preview) return;
    void getExpertsCredits().then((res) => {
      if (!res.error) setCredits(creditBalanceFromData(res.data, initialCredits));
    });
  }, [initialCredits, preview]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const onRealtime = useCallback((message: ExpertsRealtimeMessage) => {
    if (message.event !== "credit.updated") return;
    const fromEvent = parseCreditBalance(message.creditBalance);
    if (fromEvent !== null) {
      setCredits(fromEvent);
      return;
    }
    void getExpertsCredits().then((res) => {
      if (!res.error) {
        const n = parseCreditBalance(res.data?.creditBalance);
        if (n !== null) setCredits(n);
      }
    });
  }, []);
  useExpertsRealtime(onRealtime);

  const sendFeedback = () => {
    if (!reportId || rating < 1) return;
    if (preview) { setSent(true); return; }
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

  return <ReportReadyView request={request} report={report} creditBalance={credits} onCreditsPurchased={setCredits} preview={preview}>
    <section className="rounded-xl border border-[#dfdfe0] bg-white p-4 print:hidden">
      <h2 className="text-sm font-medium text-ink">Rate this report</h2>
      {sent ? <p className="mt-2 text-sm text-[#047857]">Thanks for your feedback.</p> : <>
        <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setRating(n)} className={`size-9 rounded-lg border text-sm font-medium ${rating >= n ? "border-primary-500 bg-primary-50 text-primary-500" : "border-[#e5e5e5] text-muted"}`}>{n}</button>)}</div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 400))} rows={2} placeholder="Optional comment" className="mt-3 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-primary-500" />
        <button type="button" disabled={pending || rating < 1 || !reportId} onClick={sendFeedback} className="mt-3 inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white disabled:opacity-50">{pending ? "Sending…" : "Submit feedback"}</button>
        {error && <p role="alert" className="mt-2 text-sm text-[#b91c1c]">{error}</p>}
      </>}
    </section>
  </ReportReadyView>;
}
