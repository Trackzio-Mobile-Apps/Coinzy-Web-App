"use client";

import Image from "next/image";

/**
 * Failure toast — Figma Components `1605:468708` (Property 1=Failed) /
 * Collection sell `1349:142656`. Copy node `4003:1154` was not in the file via MCP.
 */
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
      className="fixed right-6 top-[92px] z-[60] flex w-[min(100%,415px)] gap-3 rounded-xl border-l-4 border-l-[#dc2626] bg-white p-4 shadow-[-4px_18px_15px_rgba(42,42,42,0.2)]"
    >
      <Image
        src="/assets/identify/icon-alert-failed.svg"
        alt=""
        width={24}
        height={24}
        className="mt-0.5 shrink-0"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-6">
        <p className="text-sm font-medium leading-5 text-ink">{title}</p>
        <p className="text-sm leading-5 text-[#606062]">{body}</p>
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
