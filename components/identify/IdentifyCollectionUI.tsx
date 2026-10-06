"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { ArchetypeDetails } from "@/lib/api/coinzy";
import { coinTitle, detailTabs, overviewRows } from "@/lib/catalogue/coinDetails";
import { useModalDialog } from "@/components/ui/useModalDialog";
import type { UserCollectionOption } from "@/lib/identify/collections";

const DRAWER_TABS = ["Overview", "Design & Material", "Rarity", "History"] as const;

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#606062]">{label}</span>
      <span className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm text-ink">{value}</span>
    </label>
  );
}

/** Figma `1301:153660` — add-to-collection side panel. */
export function IdentifyAddToCollectionDrawer({
  open,
  coin,
  userImageUrls,
  onClose,
  onConfirmAdd,
}: {
  open: boolean;
  coin: ArchetypeDetails;
  userImageUrls: [string, string] | null;
  onClose: () => void;
  onConfirmAdd: (opts: { isOwned: boolean }) => void;
}) {
  const [tab, setTab] = useState<(typeof DRAWER_TABS)[number]>("Overview");
  const [ownsCoin, setOwnsCoin] = useState(true);
  const title = coinTitle(coin);
  const tabs = detailTabs(coin);

  if (!open) return null;

  const overview = overviewRows(coin);
  const activeDetail = tabs.find((t) => t.label === tab) ?? tabs[0];

  return (
    <>
      <button type="button" aria-label="Close panel" className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(100%,420px)] flex-col border-l border-[#efefef] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collection-title"
      >
        <header className="flex items-center gap-3 border-b border-[#efefef] px-4 py-3">
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center">
            <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
          </button>
          <h2 id="add-collection-title" className="text-base font-medium text-ink">Add to collection</h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
          <div className="flex gap-3">
            {(userImageUrls ?? coin.imageUrls).slice(0, 2).map((src, i) => (
              <div key={`${src}-${i}`} className="relative size-14 overflow-hidden rounded-lg border border-[#efefef]">
                <Image src={src} alt="" fill className="object-cover" unoptimized={src.startsWith("blob:")} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold leading-5 text-ink">{title}</p>

          <div className="mt-4 flex gap-4 border-b border-[#efefef] text-sm">
            {DRAWER_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`border-b-2 pb-2 ${
                  tab === t ? "border-primary-500 font-medium text-ink" : "border-transparent text-[#87878a]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[#edd2d3] border-l-4 border-l-primary-500 bg-[#f7e7e8]/40 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">Do you own this coin?</p>
              <div className="flex rounded-lg border border-[#e5e5e5] bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setOwnsCoin(true)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${ownsCoin ? "bg-[#f5f5f5] text-ink" : "text-muted"}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setOwnsCoin(false)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${!ownsCoin ? "bg-[#f5f5f5] text-ink" : "text-muted"}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {tab === "Overview" &&
              overview.map((row) => <ReadOnlyField key={row.label} label={row.label} value={row.value} />)}
            {tab !== "Overview" &&
              activeDetail?.groups.map((g) => (
                <div key={g.heading} className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-ink">{g.heading}</h3>
                  {g.rows.map((row) => (
                    <ReadOnlyField key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              ))}
          </div>
        </div>

        <footer className="border-t border-[#efefef] p-4">
          <button
            type="button"
            onClick={() => onConfirmAdd({ isOwned: ownsCoin })}
            className="flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white"
          >
            Add to collection
          </button>
        </footer>
      </aside>
    </>
  );
}

/** Figma `1500:287598` */
export function IdentifySelectCollectionModal({
  open,
  collections,
  loading,
  selectionLocked,
  userOwnsCoin,
  selectedId,
  onSelect,
  onClose,
  onDone,
  saving,
}: {
  open: boolean;
  collections: UserCollectionOption[];
  loading: boolean;
  /** When the user owns the coin, only Owned collection is allowed (rows disabled). */
  selectionLocked: boolean;
  /** When false, Owned collection cannot be chosen. */
  userOwnsCoin: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onDone: () => void;
  saving?: boolean;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%,440px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-xl backdrop:bg-black/55"
    >
      <div className="relative border-b border-[#efefef] px-4 py-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-8 items-center justify-center"
        >
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        <h2 id={titleId} className="pr-8 text-base font-medium text-ink">Select a collection</h2>
        <p className="mt-1 text-sm text-[#606062]">Select the coin collection that you want to add this coin to</p>
      </div>
      <ul className="max-h-[320px] overflow-y-auto px-4 py-2">
        {loading && (
          <li className="py-6 text-center text-sm text-muted">Loading collections…</li>
        )}
        {!loading &&
          collections.map((opt) => {
            const checked = opt.id === selectedId;
            const ownedRowBlocked = !userOwnsCoin && opt.kind === "owned";
            const disabled = selectionLocked || ownedRowBlocked;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onSelect(opt.id)}
                  className={`flex w-full items-center gap-3 rounded-lg py-3 text-left text-sm text-ink ${
                    disabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#fafafa]"
                  } ${selectionLocked && checked ? "cursor-default" : ""}`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                      checked ? "border-primary-500 bg-primary-500 text-white" : "border-[#c2c2c4] bg-white"
                    } ${selectionLocked ? "opacity-80" : ""}`}
                    aria-hidden
                  >
                    {checked ? "✓" : ""}
                  </span>
                  {opt.label}
                </button>
              </li>
            );
          })}
      </ul>
      <div className="flex justify-end gap-2 border-t border-[#f5f5f5] bg-[#fafafa] px-4 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={loading || saving}
          className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Done"}
        </button>
      </div>
    </dialog>
  );
}
