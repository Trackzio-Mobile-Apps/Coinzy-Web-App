"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

/**
 * Edit your Profile — Figma `1370:216726`.
 * Name editable; personal email read-only; optional sync to seller email.
 */
export function EditProfileDialog({
  open,
  onClose,
  name: initialName,
  email,
  submitting,
  error,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  submitting?: boolean;
  error?: string | null;
  onSave: (payload: { fullName: string; syncSellerEmail: boolean }) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && !submitting && onClose());
  const [name, setName] = useState(initialName);
  const [syncSellerEmail, setSyncSellerEmail] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setSyncSellerEmail(true);
    setLocalError(null);
  }, [open, initialName]);

  const submit = () => {
    const fullName = name.trim();
    if (!/^[a-zA-Z ]{3,}$/.test(fullName)) {
      setLocalError("Enter a valid Name");
      return;
    }
    setLocalError(null);
    onSave({ fullName, syncSellerEmail: syncSellerEmail && Boolean(email.trim()) });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => !submitting && onClose()}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      className="m-auto w-[572px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-1 p-4 pr-10">
        <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
          Edit your Profile
        </h2>
        <p className="text-sm leading-5 text-[#737373]">Visible to only you.</p>
        <button
          type="button"
          aria-label="Close"
          disabled={submitting}
          onClick={onClose}
          className="absolute right-4 top-4 size-4 disabled:opacity-50"
        >
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${titleId}-name`} className="text-xs font-medium text-ink">
            Name
          </label>
          <input
            id={`${titleId}-name`}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setLocalError(null);
            }}
            className="h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-sm text-ink outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${titleId}-email`} className="text-xs font-medium text-ink">
            Personal Email
          </label>
          <input
            id={`${titleId}-email`}
            type="email"
            readOnly
            value={email || "—"}
            className="h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-neutral-50 px-2.5 text-sm text-[#606062]"
          />
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={syncSellerEmail}
              disabled={!email.trim()}
              onChange={(e) => setSyncSellerEmail(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border border-[#e5e5e5] accent-primary-500"
            />
            <span className="text-sm font-medium leading-5 text-[#606062]">Use this email for seller profile too</span>
          </label>
        </div>
        {(error || localError) && <p className="text-xs text-[#dc2626]">{error || localError}</p>}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="rounded-[10px] bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </dialog>
  );
}
