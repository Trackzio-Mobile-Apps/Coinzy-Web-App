"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { createCollectionViaApi } from "@/lib/identify/collectionClient";
import { defaultNewCollectionName } from "@/lib/identify/collections";

/** Create private collection from `/collection` — same API as identify modal `1500:287599`. */
export function CollectionCreateCollectionCard({ privateCount }: { privateCount: number }) {
  const router = useRouter();
  const titleId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useModalDialog(open, (next) => !next && setOpen(false));

  useEffect(() => {
    if (open) {
      setName(defaultNewCollectionName(privateCount));
      setError(null);
    }
  }, [open, privateCount]);

  const close = () => setOpen(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    const res = await createCollectionViaApi(trimmed);
    setSaving(false);
    if (res.error) {
      setError(res.reason ?? "Could not create collection.");
      return;
    }
    close();
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full min-w-0 max-w-[411px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#edd2d3] bg-[rgba(247,231,232,0.35)] px-4 py-8 text-primary-500 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
      >
        <span className="flex size-10 items-center justify-center rounded-full border border-[#edd2d3] bg-white text-2xl leading-none font-light">
          +
        </span>
        <span className="text-sm font-medium">Add new collection</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={close}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(100%,382px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
      >
        <div className="relative p-4">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-4 items-center justify-center"
          >
            <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
          </button>
          <h2 id={titleId} className="pr-6 text-base font-medium leading-6 text-ink">Add new collection</h2>
          <p className="mt-1 text-sm leading-5 text-[#737373]">Name your private collection</p>
        </div>
        <div className="px-4 pb-4">
          <label htmlFor={inputId} className="sr-only">Collection name</label>
          <div className="flex h-9 items-center gap-1.5 rounded-[10px] border border-primary-500 bg-white px-2.5">
            <input
              id={inputId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              disabled={saving}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
              autoFocus
            />
          </div>
          <p className="mt-2 text-sm text-[#737373] opacity-80">Press Enter to save</p>
          {error ? <p className="mt-2 text-xs text-[#dc2626]" role="alert">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-1.5 border-t border-[#e5e5e5] bg-[#f5f5f5]/80 p-4">
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !name.trim()}
            className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      </dialog>
    </>
  );
}
