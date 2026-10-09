"use client";

import Image from "next/image";
import { useId } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

/** Logout / delete confirm — Figma `1370:256025` / `2047:263653`. */
export function SettingsConfirmDialog({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  confirming,
  error,
  danger,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  confirming?: boolean;
  error?: string | null;
  danger?: boolean;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && !confirming && onClose());

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => !confirming && onClose()}
      onClick={(e) => {
        if (e.target === e.currentTarget && !confirming) onClose();
      }}
      className="m-auto w-[420px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-3 p-4 pr-10">
        <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
          {title}
        </h2>
        <p className="text-sm leading-5 text-[#737373]">{body}</p>
        <button
          type="button"
          aria-label="Close"
          disabled={confirming}
          onClick={onClose}
          className="absolute right-4 top-4 size-4 disabled:opacity-50"
        >
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>
      {error && <p className="px-4 pb-2 text-xs text-[#dc2626]">{error}</p>}
      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={confirming}
          className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className={
            danger
              ? "rounded-[10px] bg-[#fef2f2] px-3 py-1.5 text-sm font-medium text-[#dc2626] hover:bg-[#fee2e2] disabled:opacity-60"
              : "rounded-[10px] bg-[#fef2f2] px-3 py-1.5 text-sm font-medium text-[#dc2626] hover:bg-[#fee2e2] disabled:opacity-60"
          }
        >
          {confirming ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
