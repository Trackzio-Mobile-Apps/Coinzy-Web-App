"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

export interface ContactDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  phone: string | null;
  email: string | null;
  subject: string;
}

function Row({ label, href, value, onCopy }: { label: string; href: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm leading-5">
      <span className="text-[#737373]">{label}:</span>
      <a href={href} className="min-w-0 break-all font-medium text-primary-500 underline underline-offset-2">{value}</a>
      <button type="button" onClick={onCopy} aria-label={`Copy ${label.toLowerCase()}`} className="ml-1 shrink-0 rounded p-1 text-[#737373] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="3" width="13" height="13" rx="2" /><path d="M16 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3" /></svg>
      </button>
    </div>
  );
}

export function ContactDetailsDialog({ open, onClose, phone, email, subject }: ContactDetailsDialogProps) {
  const titleId = useId();
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => { if (!open) setCopyStatus(""); }, [open]);
  const ref = useModalDialog(open, (next) => !next && onClose());
  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied.`);
    } catch {
      setCopyStatus(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto w-[382px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55">
      <div className="relative p-4">
        <h2 id={titleId} className="pr-8 text-base font-semibold leading-6 text-ink">Contact details</h2>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"><Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} /></button>
        <div className="mt-3 space-y-3">
          {phone && <Row label="Phone number" href={`tel:${phone.replace(/[^\d+]/g, "")}`} value={phone} onCopy={() => void copy("Phone number", phone)} />}
          {email && <Row label="Email address" href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`} value={email} onCopy={() => void copy("Email address", email)} />}
        </div>
        {copyStatus && <p role="status" className="mt-2 text-xs text-[#737373]">{copyStatus}</p>}
      </div>
    </dialog>
  );
}
