"use client";

import Image from "next/image";
import { useRef } from "react";

type Side = "obverse" | "reverse";

const SIDE_COPY: Record<Side, { title: string; hint: string }> = {
  obverse: { title: "Obverse", hint: "(front side)" },
  reverse: { title: "Reverse", hint: "(back side)" },
};

function UploadSlot({
  side,
  preview,
  onFile,
  onTakePhoto,
  onClear,
}: {
  side: Side;
  preview: string | null;
  onFile: (file: File) => void;
  onTakePhoto: () => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = SIDE_COPY[side];

  return (
    <div className="relative flex min-h-[152px] flex-1 flex-col items-center justify-center rounded-md border border-dashed border-[#87878a] bg-white px-3 py-2">
      {preview ? (
        <>
          <div className="absolute left-2 top-2 z-10 rounded bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-[#1e1e1f] shadow-sm">
            {copy.title} <span className="font-normal text-[#606062]">{copy.hint}</span>
          </div>
          <div className="relative size-[120px] overflow-hidden rounded-lg">
            <Image src={preview} alt={copy.title} fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-xs shadow"
            aria-label={`Remove ${copy.title}`}
          >
            ×
          </button>
        </>
      ) : (
        <>
          <div className="relative size-6 shrink-0 opacity-70" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#87878A" strokeWidth="1.5" />
              <circle cx="9" cy="10" r="1.5" fill="#87878A" />
              <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#87878A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm leading-5">
              <span className="font-semibold text-[#1e1e1f]">{copy.title}</span>{" "}
              <span className="text-[#606062]">{copy.hint}</span>
            </p>
            <p className="mt-1 text-xs leading-4 text-[#606062]">
              Drag and drop here to upload <span className="text-[#606062]">•</span>{" "}
              <span className="text-[#ef4444]">(Required)</span>
            </p>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg bg-[#f5f5f5] px-2.5 py-1 text-sm font-medium text-ink"
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={onTakePhoto}
              className="inline-flex items-center gap-1 rounded-lg bg-[#f5f5f5] px-2.5 py-1 text-sm font-medium text-ink"
            >
              Use camera
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

export function IdentifyUploadCard({
  obversePreview,
  reversePreview,
  onObverseFile,
  onReverseFile,
  onTakeObverse,
  onTakeReverse,
  onClearObverse,
  onClearReverse,
  onSubmit,
  busy,
}: {
  obversePreview: string | null;
  reversePreview: string | null;
  onObverseFile: (f: File) => void;
  onReverseFile: (f: File) => void;
  onTakeObverse: () => void;
  onTakeReverse: () => void;
  onClearObverse: () => void;
  onClearReverse: () => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const ready = obversePreview && reversePreview;

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
      <h2 className="text-sm font-medium leading-5 text-ink">Upload a clear photo of your coin</h2>
      <p className="mt-1 text-xs text-muted">Add obverse and reverse images of the same coin.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <UploadSlot
          side="obverse"
          preview={obversePreview}
          onFile={onObverseFile}
          onTakePhoto={onTakeObverse}
          onClear={onClearObverse}
        />
        <UploadSlot
          side="reverse"
          preview={reversePreview}
          onFile={onReverseFile}
          onTakePhoto={onTakeReverse}
          onClear={onClearReverse}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!ready || busy}
          onClick={onSubmit}
          className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Identifying…" : "Find my coin"}
        </button>
      </div>
    </div>
  );
}
