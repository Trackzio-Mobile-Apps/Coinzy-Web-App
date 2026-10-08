"use client";

import Image from "next/image";

/** Figma `1498:257365` — coin added to collection. */
export function IdentifySuccessToast({
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
      role="status"
      className="fixed right-6 top-[92px] z-[60] w-[min(100%,415px)] rounded-xl border border-[#e5e7eb] border-l-4 border-l-[#008557] bg-white p-4 shadow-[-4px_18px_15px_rgba(42,42,42,0.2)]"
    >
      <div className="flex gap-3 pr-6">
        <Image src="/assets/auth/check-circle.svg" alt="" width={24} height={24} className="shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1.5 text-sm leading-5 text-[#606062]">{body}</p>
        </div>
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
