"use client";

import Image from "next/image";
import { useId } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

export interface ContactDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Seller phone as entered by the seller; `null` hides the row. */
  phone: string | null;
  /** Seller contact email; `null` hides the row. */
  email: string | null;
  /** Prefilled `mailto:` subject. */
  subject: string;
}

const outlineButton =
  "flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white px-3 py-[5px] text-sm font-medium leading-5 text-ink hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

function Row({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <div className="flex items-start gap-1 text-sm leading-5">
      <span className="shrink-0 text-[#737373]">{label}</span>
      <a href={href} className="min-w-0 break-all font-medium text-primary-500 hover:underline">
        {value}
      </a>
    </div>
  );
}

/**
 * "Contact details" modal — Figma `1356:164759` (Dialog on a 55% black overlay): 382px card, title, phone and email rows
 * in the brand colour, light footer with an outline "Send email" button, corner close.
 *
 * Shown from the marketplace listing's "Contact seller" button to signed-in viewers only (guests included); the server
 * never passes seller contact fields to logged-out visitors. If a seller left no email the footer offers "Call" instead
 * (the design always has an email). Native `<dialog>`: focus trap, Esc, inert page, focus returns to the trigger.
 */
export function ContactDetailsDialog({ open, onClose, phone, email, subject }: ContactDetailsDialogProps) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[382px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-1 p-4">
        <h2 id={titleId} className="h-[22px] text-base font-medium leading-6 text-ink">
          Contact details
        </h2>
        {phone && telHref && <Row label="Phone number:" href={telHref} value={phone} />}
        {email && <Row label="Email address:" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} value={email} />}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] px-4 pb-4 pt-[15px]">
        {email ? (
          <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className={outlineButton}>
            Send email
          </a>
        ) : (
          telHref && (
            <a href={telHref} className={outlineButton}>
              Call
            </a>
          )
        )}
      </div>
    </dialog>
  );
}
