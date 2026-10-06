"use client";

import { useId, useRef } from "react";

function AlertIcon() {
  return (
    <span
      className="flex size-12 items-center justify-center rounded-full bg-[#ef4444] text-xl font-bold text-white"
      aria-hidden
    >
      !
    </span>
  );
}

/** Black camera viewport + copy — Figma blocked state inside `1828:206844`. */
export function IdentifyCameraPermissionViewport() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertIcon />
      <p className="text-base font-medium leading-6 text-white">Camera permission is blocked</p>
      <p className="max-w-[320px] text-sm leading-5 text-white/90">
        Your browser is blocking the camera for this site. To enable, go to browser settings and allow Camera
        permissions.
      </p>
    </div>
  );
}

export function IdentifyCameraPermissionHeader({ titleId }: { titleId?: string }) {
  return (
    <>
      <h2 id={titleId} className="pr-8 text-lg font-medium leading-7 text-ink">
        Use your camera
      </h2>
      <p className="mt-1 text-sm leading-5 text-[#606062]">
        Camera access is turned off for this site in your browser.
      </p>
    </>
  );
}

export function IdentifyCameraPermissionUploadFallback({
  sideLabel,
  onFile,
}: {
  sideLabel?: string;
  onFile: (file: File) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (file: File | undefined) => {
    if (file?.type.startsWith("image/")) onFile(file);
  };

  return (
    <>
      <div className="relative my-4 flex items-center justify-center">
        <span className="h-px w-full bg-[#e5e5e5]" aria-hidden />
        <span className="absolute bg-white px-3 text-xs text-[#87878a]">or</span>
      </div>
      <div
        className="flex min-h-[120px] flex-col items-center justify-center rounded-md border border-dashed border-[#87878a] bg-white px-3 py-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#87878A" strokeWidth="1.5" />
          <circle cx="9" cy="10" r="1.5" fill="#87878A" />
          <path
            d="M3 16l5-5 4 4 3-3 6 6"
            stroke="#87878A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-3 text-center text-xs text-[#606062]">
          {sideLabel ? (
            <>
              <span className="font-semibold text-ink">{sideLabel}</span>
              <span className="mt-1 block">Drag and drop here to upload</span>
            </>
          ) : (
            "Drag and drop here to upload"
          )}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#f5f5f5] px-2.5 py-1.5 text-sm font-medium text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Upload image
        </button>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </>
  );
}
