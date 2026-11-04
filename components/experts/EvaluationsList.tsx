"use client";

import Link from "next/link";
import { useState } from "react";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import { expertRequestId, type ExpertRequest } from "@/lib/experts/types";

export function EvaluationsList({ requests, creditBalance, preview = false }: { requests: ExpertRequest[]; creditBalance: number; preview?: boolean }) {
  const [oldestFirst, setOldestFirst] = useState(false);
  const sorted = [...requests].sort((a, b) => {
    const first = Date.parse(a.createdAt || "") || 0;
    const second = Date.parse(b.createdAt || "") || 0;
    return oldestFirst ? first - second : second - first;
  });
  return <div className="mx-auto w-full max-w-[1184px] px-4 py-4 sm:px-8"><nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-4 text-sm"><Link href={preview ? "/evaluation-hub-with-requests" : "/experts"} aria-label="Back to expert analysis" className="flex size-8 items-center justify-center rounded border border-[#c8c8ca] bg-white text-xl text-[#606062]">‹</Link><Link href={preview ? "/evaluation-hub-with-requests" : "/experts"} className="text-primary-500 underline">Expert analysis</Link><span className="text-xl text-[#606062]">›</span><span className="text-lg font-semibold text-ink">Your Evaluations</span></nav>
    <div className="flex flex-col items-start gap-4 lg:flex-row"><main className="w-full min-w-0 flex-1"><div className="mb-4 flex items-center justify-between gap-3"><h1 className="text-lg font-medium text-ink">Your requests ({requests.length})</h1><button type="button" onClick={() => setOldestFirst((value) => !value)} aria-label={`Sort by time, ${oldestFirst ? "oldest first" : "newest first"}`} className="flex items-center gap-2 text-sm font-medium text-ink">Sort by time <span aria-hidden>{oldestFirst ? "☷↑" : "☷↓"}</span></button></div>
      {sorted.length ? <ul className="space-y-4">{sorted.map((request) => <EvaluationCard key={expertRequestId(request)} request={request} preview={preview} />)}</ul> : <p className="rounded-xl border border-[#dfdfe0] bg-white p-5 text-sm text-[#606062]">You haven’t requested an evaluation yet.</p>}
    </main><ExpertsAside creditBalance={creditBalance} creditTotal={preview ? 10 : undefined} /></div></div>;
}

function EvaluationCard({ request, preview }: { request: ExpertRequest; preview: boolean }) {
  const id = expertRequestId(request);
  const status = (request.status || "").toLowerCase();
  const completed = status === "completed";
  const failed = status === "cancelled" || status === "deadline_missed";
  const media = request.payload?.media;
  const photos = [...(media?.obverse || []), ...(media?.reverse || []), ...(media?.edge || [])];
  const href = preview ? completed ? "/evaluation-report-ready" : failed ? "/evaluation-deadline-exceeded" : "/evaluation-in-progress" : completed ? `/experts/request/${id}/report` : `/experts/request/${id}`;
  const color = completed ? "#16a34a" : failed ? "#e51b23" : "#e47700";
  const date = (iso: string | null | undefined) => { const timestamp = Date.parse(iso || ""); return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp) : null; };
  const received = date(request.completedAt || request.submittedAt);
  const due = request.deadlineAt ? Date.parse(request.deadlineAt) : NaN;
  const hours = Number.isFinite(due) ? Math.max(0, Math.ceil((due - Date.now()) / 3600000)) : null;
  return <li className="rounded-xl border border-[#e8e5e3] border-l-4 bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)]" style={{ borderLeftColor: color }}><div className="flex flex-wrap justify-between gap-2 text-xs text-[#606062]"><span>◷ &nbsp;Submitted: <strong className="font-medium">{date(request.createdAt) || "—"}</strong></span>{completed ? received && <span>◷ &nbsp;Received: <strong className="font-medium">{received}</strong></span> : status === "deadline_missed" ? <span>◷ &nbsp;Est. time: <strong className="font-medium text-[#e51b23]">Overdue</strong></span> : hours !== null && <span>◷ &nbsp;Est. time: <strong className="font-medium text-ink">{hours ? `${hours}hr left` : "Due soon"}</strong></span>}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-base font-medium text-ink">Request #{(request.displayId || id).replace(/^#/, "")}</p><span className="rounded-md border px-2 py-0.5 text-xs font-medium" style={{ borderColor: color, color }}>{completed ? "✓  Report ready" : failed ? "⊘  Cancelled" : "ⓘ  In progress"}</span></div><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-6"><div className="flex items-center">{photos.slice(0, 6).map((src, i) => <img key={`${src}-${i}`} src={src} alt="" className={`${i ? "-ml-5" : ""} size-[68px] rounded-full border-2 border-[#dfdfe0] bg-[#f5f5f5] object-cover`} />)}{photos.length === 0 && <span className="text-xs text-[#737373]">No photos available</span>}</div>{media?.video && <span className="relative size-[68px] shrink-0 rounded-full border-2 border-[#dfdfe0]"><video src={media.video} muted playsInline preload="metadata" className="size-full rounded-full object-cover"/><span className="absolute bottom-0 right-0 rounded-full border border-[#dfdfe0] bg-white px-1 text-xs text-[#606062]">▶</span></span>}</div><Link href={href} className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-ink hover:bg-[#fafafa]">{completed ? "View report" : "View submission"} <span aria-hidden>→</span></Link></div></li>;
}
