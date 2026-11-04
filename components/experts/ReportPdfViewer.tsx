"use client";

import { useEffect, useRef, useState } from "react";
import { makeReportPdf } from "@/lib/experts/reportPdf";
import type { ExpertReport, ExpertRequest } from "@/lib/experts/types";

export function ReportPdfViewer({ open, onClose, request, report }: { open: boolean; onClose: () => void; request: ExpertRequest; report: ExpertReport }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) { if (dialog.current?.open) dialog.current.close(); return; }
    if (!dialog.current?.open) dialog.current?.showModal();
    setPage(0); setZoom(100); setError(""); setPages([]); setPdfUrl("");
    let cancelled = false; let url = "";
    void makeReportPdf(request, report).then((result) => { if (cancelled) return; url = URL.createObjectURL(result.pdf); setPdfUrl(url); setPages(result.pages); }).catch(() => { if (!cancelled) setError("Could not generate the report. Please try again."); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [open, report, request]);
  return <dialog ref={dialog} onClose={onClose} aria-label="Evaluation report viewer" onKeyDown={(event) => { if (event.key === "ArrowLeft") setPage((n) => Math.max(0, n - 1)); if (event.key === "ArrowRight") setPage((n) => Math.min(pages.length - 1, n + 1)); }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/55">
    <div className="relative flex h-full flex-col items-center px-12 pb-4 pt-20 sm:px-20 sm:pt-8">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-8 sm:top-7"><div className="flex h-11 items-center gap-3 rounded-full bg-white/35 px-4 text-sm"><button type="button" aria-label="Zoom out" onClick={() => setZoom((n) => Math.max(50, n - 25))} disabled={zoom <= 50} className="text-xl disabled:opacity-40">⊖</button><span className="min-w-10 text-center">{zoom}%</span><button type="button" aria-label="Zoom in" onClick={() => setZoom((n) => Math.min(250, n + 25))} disabled={zoom >= 250} className="text-xl disabled:opacity-40">⊕</button><button type="button" aria-label="Toggle fullscreen" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void dialog.current?.requestFullscreen(); }} className="ml-2 text-xl">⛶</button></div><button type="button" onClick={onClose} aria-label="Close viewer" className="flex size-11 items-center justify-center rounded-full bg-white/35 text-3xl leading-none">×</button></div>
      <div className="flex min-h-0 w-full flex-1 items-start justify-center overflow-auto">{error ? <p role="alert" className="mt-12 text-white">{error}</p> : pages.length ? <img src={pages[page]} alt={`Evaluation report page ${page + 1} of ${pages.length}`} style={{ width: `${zoom * 5.95}px` }} className="max-w-none shrink-0 bg-white shadow-xl" /> : <p className="mt-12 text-white" role="status">Generating report…</p>}</div>
      {pages.length > 1 && <><button type="button" disabled={page === 0} onClick={() => setPage((n) => Math.max(0, n - 1))} aria-label="Previous page" className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] border border-[#dfdfe0] bg-white text-2xl text-[#101a35] disabled:opacity-40 sm:left-8">‹</button><button type="button" disabled={page === pages.length - 1} onClick={() => setPage((n) => Math.min(pages.length - 1, n + 1))} aria-label="Next page" className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] border border-[#dfdfe0] bg-white text-2xl text-[#101a35] disabled:opacity-40 sm:right-8">›</button></>}
      {pdfUrl && <div className="flex items-center gap-4 pt-2 text-sm"><span aria-live="polite">{page + 1} of {pages.length}</span><a href={pdfUrl} download={`evaluation-${(request.displayId || "report").replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`} className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white">Download PDF ⤓</a></div>}
    </div>
  </dialog>;
}
