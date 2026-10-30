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
    <div className="relative flex min-h-[148px] min-w-0 flex-1 flex-col items-center justify-center rounded-md border-[0.5px] border-dashed border-[#87878a] bg-white px-3 py-4">
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
            className="absolute right-2 top-2 flex size-[22px] items-center justify-center"
            aria-label={`Remove ${copy.title}`}
          >
            <Image src="/assets/identify/icon-remove.svg" alt="" width={22} height={22} />
          </button>
        </>
      ) : (
        <>
          <div className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
            <Image src="/assets/experts/icon-upload-image.svg" alt="" width={21} height={21} />
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm leading-5">
              <span className="font-medium text-[#1e1e1f]">{copy.title}</span>
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
              className="inline-flex items-center gap-1 h-7 rounded-lg bg-[#e8e8e8] px-2.5 py-1 text-sm font-medium leading-5 text-ink"
            >
              <Image src="/assets/experts/icon-upload-btn.svg" alt="" width={14} height={14} />
              Upload file
            </button>
            <button
              type="button"
              onClick={onTakePhoto}
              className="inline-flex items-center gap-1 h-7 rounded-lg bg-[#e8e8e8] px-2.5 py-1 text-sm font-medium leading-5 text-ink"
            >
              <Image src="/assets/marketplace/icon-camera.svg" alt="" width={16} height={16} />
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
    <div className="flex flex-col gap-6 rounded-xl bg-white p-4">
      <h2 className="text-lg font-medium leading-[22px] text-[#0a0a0a]">Upload a clear photo of your coin</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
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
      <div className="flex justify-end">
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
