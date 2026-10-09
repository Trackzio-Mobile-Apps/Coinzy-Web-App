"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

/** Feedback sheet — fire-and-forget `POST /api/feedback` (no success/error UI). */
export function FeedbackDialog({
  open,
  onClose,
  defaultName,
  defaultEmail,
}: {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  defaultEmail: string;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setEmail(defaultEmail);
    setMessage("");
  }, [open, defaultName, defaultEmail]);

  const valid = name.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && message.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const body = JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() });
    onClose();
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* async — ignore result */
    });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[520px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-1 p-4 pr-10">
        <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
          Feedback
        </h2>
        <p className="text-sm leading-5 text-[#737373]">Tell us how we can improve Coinzy.</p>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 size-4">
          <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <Field label="Name" id={`${titleId}-name`}>
          <input
            id={`${titleId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" id={`${titleId}-email`}>
          <input
            id={`${titleId}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>
        <Field label="Message" id={`${titleId}-message`}>
          <textarea
            id={`${titleId}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Please enter feedback"
            className="w-full resize-y rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 py-2 text-sm outline-none focus:border-primary-500"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={submit}
          className="rounded-[10px] bg-primary-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </dialog>
  );
}

const inputCls =
  "h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-sm outline-none focus:border-primary-500";

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}
