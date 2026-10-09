"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { SETTINGS_FAQ } from "@/lib/settings/faq";

/** In-app FAQ accordion — Android `FAQScreen` content. */
export function FaqDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto h-[min(720px,calc(100dvh-48px))] w-[640px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
        <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
          FAQ
        </h2>
        <button type="button" aria-label="Close" onClick={onClose} className="size-4">
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>
      <div className="max-h-[calc(min(720px,100dvh-48px)-52px)] overflow-y-auto p-2">
        {SETTINGS_FAQ.map((item, index) => {
          const expanded = openIndex === index;
          return (
            <div key={item.question} className="border-b border-[#f0f0f0] last:border-0">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpenIndex(expanded ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium text-ink hover:bg-black/[0.02]"
              >
                <span>{item.question}</span>
                <Image
                  src="/assets/catalogue/icon-chevron-right.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={`shrink-0 opacity-50 transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </button>
              {expanded && <p className="px-3 pb-3 text-sm leading-5 text-[#737373]">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </dialog>
  );
}
