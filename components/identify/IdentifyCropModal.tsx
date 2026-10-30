"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { IdentifyCameraGuide } from "@/components/identify/IdentifyCameraGuide";
import { IdentifyZoomSlider, zoomScaleFromSlider } from "@/components/identify/IdentifyZoomSlider";
import { useModalDialog } from "@/components/ui/useModalDialog";

/** The guide uses a 540×420 viewport with a centred 240px crop. */
export function IdentifyCropModal({ file, side, onClose, onConfirm }: {
  file: File;
  side: "obverse" | "reverse";
  onClose: () => void;
  onConfirm: (file: File) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(true, (open) => !open && onClose());
  const imageRef = useRef<HTMLImageElement>(null);
  const active = useRef(true);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [source, setSource] = useState("");
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const scale = size.width && size.height
    ? (240 / Math.max(size.width, size.height)) * zoomScaleFromSlider(zoom)
    : 1;
  const width = size.width * scale;
  const height = size.height * scale;
  // Centre smaller images; once zoomed in, keep the guide within the image bounds.
  const clamp = (value: number, extent: number) => {
    const limit = Math.max(0, (extent - 240) / 2);
    return Math.max(-limit, Math.min(limit, value));
  };
  const x = size.width ? clamp(offset.x, width) : 0;
  const y = size.height ? clamp(offset.y, height) : 0;

  const confirm = async () => {
    if (!imageRef.current || !size.width || saving) return;
    setSaving(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      context.fillStyle = "black";
      context.fillRect(0, 0, 1024, 1024);
      context.drawImage(imageRef.current, (width / 2 - 120 - x) / scale, (height / 2 - 120 - y) / scale, 240 / scale, 240 / scale, 0, 0, 1024, 1024);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!active.current) return;
      if (!blob) throw new Error();
      onConfirm(new File([blob], `${side}.jpg`, { type: "image/jpeg" }));
    } catch {
      setError("Could not crop this image. Try another photo.");
    } finally {
      if (active.current) setSaving(false);
    }
  };

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onClick={(event) => event.target === event.currentTarget && !saving && onClose()} className="m-auto w-[572px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[14px] border-0 bg-white p-0 shadow-xl backdrop:bg-black/55">
      <div className="relative border-b border-[#e5e5e5] p-4">
        <button type="button" onClick={onClose} disabled={saving} aria-label="Close crop" className="absolute right-4 top-4 flex size-4 items-center justify-center">
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        <h2 id={titleId} className="pr-8 text-base font-medium leading-6 text-ink">Crop your coin photo</h2>
        <p className="mt-1 text-sm leading-5 text-muted">Drag and zoom to position the entire coin inside the guide.</p>
        <p className="mt-1 text-xs text-[#87878a]">{side === "obverse" ? "Obverse (front side)" : "Reverse (back side)"}</p>
      </div>
      <div className="p-4">
        <div
          role="group" aria-label="Crop position; drag or use arrow keys to move the photo" tabIndex={0}
          className="relative aspect-[9/7] w-full touch-none overflow-hidden rounded-2xl bg-black outline-offset-2 focus-visible:outline-primary-500"
          onPointerDown={(event) => {
            if (!size.width || saving) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, left: x, top: y };
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            const ratio = 540 / event.currentTarget.getBoundingClientRect().width;
            setOffset({ x: clamp(drag.current.left + (event.clientX - drag.current.x) * ratio, width), y: clamp(drag.current.top + (event.clientY - drag.current.y) * ratio, height) });
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          onKeyDown={(event) => {
            if (!size.width || saving || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            setOffset({ x: clamp(x + (event.key === "ArrowLeft" ? -10 : event.key === "ArrowRight" ? 10 : 0), width), y: clamp(y + (event.key === "ArrowUp" ? -10 : event.key === "ArrowDown" ? 10 : 0), height) });
          }}
        >
          {source && <Image ref={imageRef} src={source} alt="Coin photo to crop" width={size.width || 540} height={size.height || 420} unoptimized draggable={false}
            onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            onError={() => { setSize({ width: 0, height: 0 }); setError("Could not open this image. Try a JPG or PNG photo."); }}
            className="pointer-events-none absolute select-none"
            style={{ maxWidth: "none", width: `${width / 540 * 100}%`, height: `${height / 420 * 100}%`, left: `${(270 - width / 2 + x) / 540 * 100}%`, top: `${(210 - height / 2 + y) / 420 * 100}%` }} />}
          <IdentifyCameraGuide className="z-10" />
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-[#db340b]">{error}</p>}
      </div>
      <div className="flex flex-col gap-4 border-t border-[#e5e5e5] bg-[#f5f5f5] px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+8px)] sm:flex-row sm:items-center sm:justify-between">
        <IdentifyZoomSlider value={zoom} onChange={(value) => { setOffset({ x, y }); setZoom(value); }} />
        <div className="flex shrink-0 justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">Cancel</button>
          <button type="button" onClick={confirm} disabled={!size.width || saving} className="h-8 rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50">{saving ? "Cropping…" : "Use photo"}</button>
        </div>
      </div>
    </dialog>
  );
}
