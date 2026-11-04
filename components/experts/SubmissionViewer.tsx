"use client";

import { useEffect, useRef, useState } from "react";

export function SubmissionViewer({ open, onClose, photos, video, initialIndex, notes }: {
  open: boolean;
  onClose: () => void;
  photos: string[];
  video?: string | null;
  initialIndex: number;
  notes?: string | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const items = [...photos.map((src) => ({ src, type: "Image" as const })), ...(video ? [{ src: video, type: "Video" as const }] : [])];
  const current = items[index];

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setZoom(100);
      if (!dialog.current?.open) dialog.current?.showModal();
    } else if (dialog.current?.open) dialog.current.close();
  }, [open, initialIndex]);

  function select(next: number) {
    setIndex(Math.max(0, Math.min(items.length - 1, next)));
    setZoom(100);
  }

  return (
    <dialog ref={dialog} onClose={onClose} aria-label="Submission media viewer" onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); select(index - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); select(index + 1); }
    }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/55">
      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-12 pb-24 pt-20 sm:px-20 sm:pb-28">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-8 sm:top-7">
          <div className="flex h-11 items-center gap-3 rounded-full bg-white/35 px-4 text-sm">
            <button type="button" onClick={() => setZoom((n) => Math.max(50, n - 25))} disabled={!current || zoom <= 50} aria-label="Zoom out" className="text-xl disabled:opacity-40">⊖</button>
            <span className="min-w-10 text-center">{zoom}%</span>
            <button type="button" onClick={() => setZoom((n) => Math.min(300, n + 25))} disabled={!current || zoom >= 300} aria-label="Zoom in" className="text-xl disabled:opacity-40">⊕</button>
            <button type="button" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void dialog.current?.requestFullscreen(); }} aria-label="Toggle fullscreen" className="ml-2 text-xl">⛶</button>
          </div>
          <button type="button" onClick={onClose} aria-label="Close viewer" className="flex size-11 items-center justify-center rounded-full bg-white/35 text-3xl leading-none">×</button>
        </div>
        {items.length > 1 && <><button type="button" onClick={() => select(index - 1)} disabled={index === 0} aria-label="Previous media" className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] border border-[#dfdfe0] bg-white text-2xl text-[#101a35] disabled:opacity-40 sm:left-8">‹</button><button type="button" onClick={() => select(index + 1)} disabled={index === items.length - 1} aria-label="Next media" className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] border border-[#dfdfe0] bg-white text-2xl text-[#101a35] disabled:opacity-40 sm:right-8">›</button></>}
        {current ? <><div className={`flex max-h-[52vh] w-full items-center justify-center overflow-auto ${current.type === "Video" ? "max-w-[786px]" : "max-w-[382px]"}`}>
          {current.type === "Image" ? <img src={current.src} alt={`Submitted coin photo ${index + 1}`} style={{ width: `${zoom}%`, maxWidth: "none" }} className="shrink-0 rounded-lg object-contain" /> : <video key={current.src} src={current.src} controls playsInline style={{ width: `${zoom}%`, maxWidth: "none" }} className="max-h-[52vh] shrink-0 rounded-lg bg-black object-contain" />}
        </div><p aria-live="polite" className="text-sm font-medium">{index + 1} of {items.length} • {current.type}</p></> : <p>No submission media available.{notes ? ` ${notes}` : ""}</p>}
        {items.length > 0 && <div className="absolute bottom-6 left-1/2 flex max-w-[calc(100%-32px)] -translate-x-1/2 gap-2 overflow-x-auto sm:bottom-10">{items.map((item, i) => <button key={`${item.src}-${i}`} type="button" onClick={() => select(i)} aria-label={`View ${item.type.toLowerCase()} ${i + 1}`} aria-current={i === index ? "true" : undefined} className={`relative size-16 shrink-0 overflow-hidden rounded-[10px] border-2 ${i === index ? "border-white" : "border-white/30"}`}>
          {item.type === "Image" ? <img src={item.src} alt="" className="size-full object-cover" /> : <><video src={item.src} preload="metadata" muted playsInline className="size-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">▶</span></>}
        </button>)}</div>}
      </div>
    </dialog>
  );
}
