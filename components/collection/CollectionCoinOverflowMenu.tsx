"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

const DETAIL_ICONS = "/assets/coin-details";

/** Overflow (⋯) on collection coin details: Delete from collection + confirm dialog. */
export function CollectionCoinOverflowMenu({
  coinId,
  coinTitle,
  returnHref,
}: {
  coinId: string;
  coinTitle: string;
  /** Where to go after a successful delete (bucket / private collection / `/collection`). */
  returnHref: string;
}) {
  const router = useRouter();
  const menuId = useId();
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useModalDialog(confirmOpen, (next) => {
    if (!next) {
      setConfirmOpen(false);
      setError(null);
    }
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openConfirm = () => {
    setMenuOpen(false);
    setError(null);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setError(null);
  };

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/coin/delete/${encodeURIComponent(coinId)}`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
      const json = (await res.json()) as { error?: boolean; reason?: string };
      if (!res.ok || json.error) {
        setError(json.reason ?? "Could not delete coin.");
        setDeleting(false);
        return;
      }
      setConfirmOpen(false);
      router.replace(returnHref);
      router.refresh();
    } catch {
      setError("Could not delete coin.");
      setDeleting(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white"
      >
        <Image src={`${DETAIL_ICONS}/icon-more-horizontal.svg`} alt="" width={20} height={20} />
      </button>

      {menuOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[200px] rounded-[10px] border border-[#e5e5e5] bg-white py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.2)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={openConfirm}
            className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-[#dc2626] hover:bg-[#fafafa]"
          >
            Delete from collection
          </button>
        </div>
      ) : null}

      {/*
        Figma Copy `4003:20563` — AlertDialog. MCP could not resolve that node in Copy or
        main file; shell matches shipped AlertDialog (`DailyLimitDialog` / `1912:211426`).
      */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={closeConfirm}
        onClick={(e) => e.target === e.currentTarget && closeConfirm()}
        className="m-auto w-[382px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
      >
        <div className="relative flex items-start gap-4 p-4">
          <div className="flex items-center pb-2">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fef2f2] text-lg font-medium leading-none text-[#dc2626]"
              aria-hidden
            >
              !
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-4">
            <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
              Delete from collection?
            </h2>
            <p className="text-sm leading-5 text-muted">
              Are you sure you want to remove{" "}
              <span className="font-medium text-ink">{coinTitle}</span> from your collection? This
              can’t be undone.
            </p>
            {error ? (
              <p className="text-xs text-[#dc2626]" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeConfirm}
            disabled={deleting}
            className="absolute right-2 top-2 size-4 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] p-4">
          <button
            type="button"
            onClick={closeConfirm}
            disabled={deleting}
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmDelete()}
            disabled={deleting}
            className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#dc2626] px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
