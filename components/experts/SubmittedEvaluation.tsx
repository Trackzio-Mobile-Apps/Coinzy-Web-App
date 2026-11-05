"use client";

import Link from "next/link";
import { useState } from "react";
import { SubmissionViewer } from "@/components/experts/SubmissionViewer";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import { expertRequestId, type ExpertRequest } from "@/lib/experts/types";

export function SubmittedEvaluation({ request, creditBalance, onCreditsPurchased, onExtend, error, preview }: {
  request: ExpertRequest;
  creditBalance: number;
  onCreditsPurchased: (balance: number) => void;
  onExtend?: () => void;
  error?: string;
  preview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const openViewer = (index: number) => { setInitialIndex(index); setOpen(true); };
  const id = request.displayId || expertRequestId(request);
  const media = request.payload?.media;
  const photos = [...(media?.obverse || []), ...(media?.reverse || []), ...(media?.edge || [])];
  const count = `${photos.length} photo${photos.length === 1 ? "" : "s"}${media?.video ? " · 1 video" : ""}`;
  const hours = request.deadlineAt ? Math.max(0, Math.ceil((Date.parse(request.deadlineAt) - Date.now()) / 3600000)) : null;
  const missed = (request.status || "").toLowerCase() === "deadline_missed";
  const assigned = (request.status || "").toLowerCase() === "accepted";
  const offered = (request.status || "").toLowerCase() === "offered";
  const created = request.createdAt ? new Date(request.createdAt) : null;
  const updated = request.updatedAt ? new Date(request.updatedAt) : null;
  const updatedDate = updated && !Number.isNaN(updated.getTime()) ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }).format(updated) : null;
  const date = created && !Number.isNaN(created.getTime()) ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }).format(created) : null;
  return (
    <div className="mx-auto w-full max-w-[1184px] px-4 py-4 sm:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/experts" aria-label="Back to expert analysis" className="flex size-8 items-center justify-center rounded border border-[#c8c8ca] bg-white text-xl text-[#606062]">‹</Link>
        <span className="text-primary-500">•••</span><span className="text-xl text-[#606062]">›</span>
        <Link href="/experts" className="text-primary-500 underline">Expert analysis</Link><span className="text-xl text-[#606062]">›</span>
        <span className="text-lg font-semibold text-ink">Request ID #{id.replace(/^#/, "")}</span>
      </nav>
      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <main className="min-w-0 w-full flex-1 space-y-4">
          <section className="overflow-hidden rounded-xl border border-[#dfdfe0] bg-white">
            <div className="p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h1 className="text-base font-medium leading-6 text-ink">{missed ? "A new evaluation request has been created!" : "Evaluation request submitted!"}</h1><p className="mt-1 text-sm leading-5 text-[#606062]">{missed ? "You have resubmitted your request with a new expert." : assigned ? "An expert is reviewing your evaluation request." : "You’ve submitted your evaluation request. We will be assigning an expert soon."}</p></div>
                <div className="text-right"><span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${missed ? "border-[#e51b23] text-[#e51b23]" : offered ? "border-[#aaa] text-[#777]" : "border-[#e47700] text-[#e47700]"}`}>{missed ? "⊘  Cancelled" : offered ? "ⓘ  Pending" : "ⓘ  In progress"}</span>{(missed || hours !== null) && <p className="mt-2 text-xs text-[#606062]">◷ &nbsp;Est. time: <strong className={missed ? "text-[#e51b23]" : "text-ink"}>{missed ? "Overdue" : hours && hours > 0 ? `${hours}hr left` : "Due soon"}</strong></p>}</div>
              </div>
              <div className="flex min-h-[142px] items-center justify-between gap-4 py-5 sm:px-5">
                <div className="flex flex-wrap items-center pl-0 sm:pl-1">{photos.slice(0, 6).map((url, i) => <button key={`${url}-${i}`} type="button" onClick={() => openViewer(i)} aria-label={`View submitted photo ${i + 1}`} className={`${i ? "-ml-5" : ""} size-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#dfdfe0] bg-[#f5f5f5] sm:size-[90px]`}><img src={url} alt="" className="size-full object-cover" /></button>)}{photos.length === 0 && <span className="text-sm text-[#737373]">No photos available</span>}</div>
                {media?.video && <button type="button" onClick={() => openViewer(photos.length)} className="relative flex size-[72px] shrink-0 items-center justify-center rounded-full border-2 border-[#dfdfe0] bg-[#f4f4f4] text-2xl text-[#606062] sm:size-[90px]" aria-label="View submitted video"><video src={media.video} preload="metadata" muted playsInline className="absolute inset-0 size-full rounded-full object-cover" /><span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border border-[#dfdfe0] bg-white text-xs text-[#606062]">▶</span></button>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfdfe0] px-4 py-3"><div><p className="text-sm font-medium text-ink">Request #{id.replace(/^#/, "")}</p><p className="mt-1 text-xs text-[#606062]">{count} submitted</p></div>{missed ? <div className="flex flex-wrap gap-3"><button type="button" onClick={onExtend} className="h-9 rounded-[10px] border border-[#dfdfe0] px-4 text-sm font-medium text-primary-500 hover:bg-[#f8f8f8]">Extend evaluation time</button><Link href="/experts/new" className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700">Resubmit for evaluation</Link></div> : <button type="button" onClick={() => openViewer(0)} className="h-9 rounded-[10px] border border-[#dfdfe0] px-4 text-sm font-medium text-ink hover:bg-[#f8f8f8]">View submission</button>}</div>
          </section>
          <section className="rounded-xl border border-[#dfdfe0] bg-white p-4"><h2 className="text-base font-medium text-ink">Evaluation progress</h2><ol className="mt-5 space-y-0 px-2 sm:px-8">
            <Step title="Coin Uploaded" detail={missed ? "Photos are uploading" : "Photos uploaded"} date={date} state="done" line />
            <Step title="Evaluation Status" detail={missed ? "Experts received your coin request" : assigned ? "Experts Received your request" : "Expert has not been assigned yet"} state={missed ? "failed" : offered ? "pending" : "active"} date={missed ? updatedDate : undefined} line />
            <Step title="Report Ready" detail={missed ? "Received detailed evaluation" : "Receive detailed evaluation"} state={missed ? "failed" : "pending"} />
          </ol></section>
          <div className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${missed ? "border-[#fecaca] bg-[#fce8e8] text-[#e51b23]" : "border-[#bfdbfe] bg-[#eff6ff] text-[#193cb8]"}`}><span className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-lg text-white ${missed ? "bg-[#e51b23]" : "bg-[#2b7fff]"}`}>ⓘ</span>{missed ? "Your evaluation was cancelled. You can either book a new evaluation or apply for a refund." : assigned ? "You’ll receive a notification when your report is ready" : "You’ll receive a notification when an expert is assigned for your request"}</div>{error && <p role="alert" className="text-sm text-[#b91c1c]">{error}</p>}
        </main>
        <ExpertsAside creditBalance={creditBalance} creditTotal={preview && missed ? 10 : undefined} onCreditsPurchased={onCreditsPurchased} requestSummary={<div className="rounded-xl border border-[#dfdfe0] bg-white p-3"><p className="text-sm font-medium text-[#39393b]">Request ID #{id.replace(/^#/, "")}</p><p className="mt-1 text-xs text-[#606062]">{count}</p>{(missed || hours !== null) && <div className="mt-4 flex items-center justify-between gap-2 rounded-[10px] border border-[#dfdfe0] bg-[#f4f5f6] p-3 text-xs text-[#606062]"><span>◷ &nbsp;Report expected in</span><strong className={`text-sm ${missed ? "text-[#e51b23]" : "text-primary-500"}`}>{missed ? "Overdue" : hours && hours > 0 ? `${hours} hours` : "Due soon"}</strong></div>}</div>} />
      </div>
      <SubmissionViewer open={open} onClose={() => setOpen(false)} photos={photos} video={media?.video} initialIndex={initialIndex} notes={request.payload?.notes} />
    </div>
  );
}

function Step({ title, detail, date, state, line }: { title: string; detail: string; date?: string | null; state: "done" | "active" | "pending" | "failed"; line?: boolean }) {
  const colors = state === "done" ? "bg-[#16a34a]" : state === "active" ? "bg-[#e47700]" : state === "failed" ? "bg-[#e51b23]" : "bg-[#dfdfe0]";
  return <li className="flex gap-3"><div className="flex w-10 shrink-0 flex-col items-center"><span className={`flex size-[38px] items-center justify-center rounded-full text-xl text-white ${colors}`}>{state === "done" ? <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="m4 12 5 5L20 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : title === "Evaluation Status" ? <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2M9 2h6M12 2v3M18 5l1.5-1.5"/></svg> : <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="4"/><path d="m9 14 3-7 3 7m-5-2h4M8 18h8"/></svg>}</span>{line && <span className={`my-2 min-h-[30px] w-0.5 flex-1 ${state === "done" ? "bg-[#16a34a]" : state === "failed" ? "bg-[#e51b23]" : "bg-[#dfdfe0]"}`} />}</div><div className="min-w-0 flex-1 pb-6"><div className="flex flex-wrap items-center justify-between gap-2"><p className={`text-base ${state === "pending" ? "text-[#606062]" : "text-ink"}`}>{title}</p><span className={`rounded-full px-2 py-0.5 text-sm ${state === "done" ? "bg-[#d1eedc] text-[#16a34a]" : state === "active" ? "bg-[#fae7d1] text-[#e47700]" : state === "failed" ? "bg-[#fce8e8] text-[#e51b23]" : "bg-[#ededed] text-[#aaa]"}`}>{state === "done" ? "Completed" : state === "active" ? "In progress" : state === "failed" ? "Cancelled" : "Pending"}</span></div><p className="mt-1 text-sm text-[#777]">{detail}</p>{date && <p className="mt-1 text-sm text-[#777]">{date}</p>}</div></li>;
}
