"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { ArchetypeDetails } from "@/lib/api/coinzy";
import { coinTitle, detailTabs, overviewRows } from "@/lib/catalogue/coinDetails";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { defaultNewCollectionName, type UserCollectionOption } from "@/lib/identify/collections";

function CollectionCheckbox({
  checked,
  disabled,
}: {
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded border shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ${
        checked ? "border-primary-500 bg-primary-500 text-white" : "border-[#e5e5e5] bg-white"
      } ${disabled ? "opacity-50" : ""}`}
      aria-hidden
    >
      {checked ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3">
          <path
            d="M2.5 6L5 8.5L9.5 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

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

/** Figma `1500:287598` · name row `1500:287599` */
export function IdentifySelectCollectionModal({
  open,
  collections,
  loading,
  userOwnsCoin,
  selectedId,
  onSelect,
  onClose,
  onDone,
  onCreateCollection,
  saving,
}: {
  open: boolean;
  collections: UserCollectionOption[];
  loading: boolean;
  /** When false, only Owned is disabled; Identified + private stay selectable. */
  userOwnsCoin: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onDone: () => void;
  onCreateCollection: (name: string) => Promise<{ error: true; reason?: string } | { error: false }>;
  saving?: boolean;
}) {
  const titleId = useId();
  const inputId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [nameEdited, setNameEdited] = useState(false);

  const privateCount = collections.filter((o) => o.kind === "private").length;

  useEffect(() => {
    if (!open) {
      setCreateOpen(false);
      setCreateError(null);
      setCreating(false);
      setNameEdited(false);
      return;
    }
    setNewName(defaultNewCollectionName(privateCount));
    setNameEdited(false);
  }, [open, privateCount]);

  const saveNewCollection = async (): Promise<boolean> => {
    const name = newName.trim();
    if (!name || creating) return false;
    setCreating(true);
    setCreateError(null);
    const res = await onCreateCollection(name);
    setCreating(false);
    if (res.error) {
      setCreateError(res.reason ?? "Could not create collection.");
      return false;
    }
    setCreateOpen(false);
    return true;
  };

  const handleDone = async () => {
    if (loading || saving || creating) return;
    if (createOpen && newName.trim() && nameEdited) {
      const created = await saveNewCollection();
      if (!created) return;
    }
    onDone();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto w-[min(100%,382px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative p-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-4 items-center justify-center"
        >
          <Image src="/assets/auth/close.svg" alt="" width={16} height={16} />
        </button>
        <h2 id={titleId} className="pr-6 text-base font-medium leading-6 text-ink">Select a collection</h2>
        <p className="mt-1 text-sm leading-5 text-[#737373]">
          Select the coin collection that you want to add this coin to
        </p>
      </div>

      <div className="flex max-h-[min(60vh,420px)] flex-col gap-4 overflow-y-auto px-4 pb-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted">Loading collections…</p>
        ) : (
          <ul className="flex flex-col">
            {collections.map((opt) => {
              const checked = opt.id === selectedId;
              // Only Owned is gated: disabled when the user said they do not own the coin.
              const rowDisabled = !userOwnsCoin && opt.kind === "owned";
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    disabled={rowDisabled}
                    onClick={() => !rowDisabled && onSelect(opt.id)}
                    className={`flex w-full items-start gap-2 p-3 text-left text-sm font-medium text-[#606062] ${
                      rowDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-[#fafafa]"
                    }`}
                  >
                    <CollectionCheckbox checked={checked} disabled={rowDisabled} />
                    <span className="leading-5">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div
          className={`rounded-xl border border-[#edd2d3] bg-[rgba(247,231,232,0.3)] py-3 ${
            createOpen ? "gap-2.5" : ""
          } flex flex-col`}
        >
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateOpen((v) => !v);
              if (!createOpen) {
                setNewName(defaultNewCollectionName(privateCount));
                setNameEdited(false);
              }
            }}
            className="flex w-full items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-500"
          >
            <span className="flex size-4 items-center justify-center text-base leading-none" aria-hidden>
              {createOpen ? "−" : "+"}
            </span>
            Add new collections
          </button>
          {createOpen && (
            <div className="flex flex-col gap-2 px-4">
              <div className="flex h-8 items-center gap-1.5 rounded-[10px] border border-primary-500 bg-white px-2.5 py-1">
                <input
                  id={inputId}
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNameEdited(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveNewCollection();
                    }
                  }}
                  disabled={creating}
                  className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none"
                  autoFocus
                />
                {newName ? (
                  <button
                    type="button"
                    aria-label="Clear name"
                    onClick={() => setNewName("")}
                    className="flex size-4 shrink-0 items-center justify-center opacity-70"
                  >
                    <Image src="/assets/auth/close.svg" alt="" width={14} height={14} />
                  </button>
                ) : null}
              </div>
              <p className="text-sm leading-5 text-[#737373] opacity-80">Press Enter to save</p>
              {createError ? <p className="text-xs text-[#dc2626]" role="alert">{createError}</p> : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-1.5 border-t border-[#e5e5e5] bg-[#f5f5f5]/80 p-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleDone()}
          disabled={loading || saving || creating}
          className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving || creating ? "Saving…" : "Done"}
        </button>
      </div>
    </dialog>
  );
}
