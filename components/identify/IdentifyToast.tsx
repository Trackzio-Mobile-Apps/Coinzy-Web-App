"use client";

import Image from "next/image";

/** Figma identify error toast `1493:236892` (same shell as success `1498:257365`, error accent). */
export function IdentifyToast({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div
      role="alert"
      className="fixed right-6 top-[92px] z-[60] flex w-[min(100%,415px)] gap-3 rounded-xl border border-[#e5e7eb] border-l-4 border-l-[#dc2626] bg-white p-4 shadow-[-4px_18px_15px_rgba(42,42,42,0.2)]"
    >
      <div
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fef2f2] text-sm font-bold text-[#dc2626]"
        aria-hidden
      >
        !
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1.5 text-sm leading-5 text-[#606062]">{body}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-2 flex size-5 items-center justify-center"
      >
        <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
      </button>
    </div>
  );
}
