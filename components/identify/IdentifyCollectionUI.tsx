"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { ArchetypeDetails } from "@/lib/api/coinzy";
import { coinTitle, detailTabs, overviewRows } from "@/lib/catalogue/coinDetails";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { defaultNewCollectionName, MAX_COLLECTION_NAME_LENGTH, type UserCollectionOption } from "@/lib/identify/collections";

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

const OWNERSHIP_TAB = "Ownership details";
const DRAWER_TABS = ["Overview", "Design & Material", "Rarity", "History"] as const;

function sectionId(label: string) {
  return `add-collection-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-6 px-5 py-2 ${
        last ? "" : "border-b-[0.5px] border-[#dfdfe0]"
      }`}
    >
      <span className="text-xs font-medium leading-4 text-ink">{label}</span>
      <span className="text-xs leading-4 text-[#606062]">{value}</span>
    </div>
  );
}

function RowTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => (
        <TableRow key={row.label} label={row.label} value={row.value} last={i === rows.length - 1} />
      ))}
    </div>
  );
}

const inputCls =
  "h-8 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-2.5 text-sm font-light text-ink placeholder:text-xs placeholder:font-normal placeholder:text-[#a4a4a7]";

function OwnChoice({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-6 w-12 items-center justify-center rounded-lg text-xs font-medium leading-4 transition ${
        selected ? "bg-primary-500 text-white" : "bg-[#e8e8e8] text-[#0a0a0a] hover:bg-[#dcdcdc]"
      }`}
    >
      {label}
    </button>
  );
}

/** Figma side panel (`14yn59xnvhy`, `14yn59xnvjx`): 585px, one scrolling page; Yes reveals ownership fields + tab. */
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
  onConfirmAdd: (opts: {
    isOwned: boolean;
    dateAcquired?: string;
    purchasePrice?: string;
    notes?: string;
  }) => void;
}) {
  const [ownsCoin, setOwnsCoin] = useState(true);
  const [dateAcquired, setDateAcquired] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<string>(OWNERSHIP_TAB);
  const title = coinTitle(coin);
  const detail = detailTabs(coin);

  if (!open) return null;

  const overview = overviewRows(coin);
  const tabLabels = ownsCoin ? [OWNERSHIP_TAB, ...DRAWER_TABS] : [...DRAWER_TABS];
  const current = tabLabels.includes(activeTab) ? activeTab : tabLabels[0];

  const goTo = (label: string) => {
    setActiveTab(label);
    document.getElementById(sectionId(label))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <button type="button" aria-label="Close panel" className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[585px] flex-col rounded-l-xl border-l border-[#e5e5e5] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-collection-title"
      >
        <header className="flex h-12 shrink-0 items-center gap-2.5 rounded-tl-xl bg-[#f2f2f3] px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-6 items-center justify-center rounded-lg bg-white hover:bg-neutral-50"
          >
            <Image src="/assets/auth/close.svg" alt="" width={12} height={12} />
          </button>
          <span className="text-sm font-medium leading-5 text-ink">Add to collection</span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-2 px-8 pb-8 pt-4">
            <div className="flex items-center justify-center gap-5 px-4">
              {(userImageUrls ?? coin.imageUrls).slice(0, 2).map((src, i) => (
                <div key={`${src}-${i}`} className="relative size-[90px] shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={src.startsWith("blob:") || src.startsWith("data:")}
                  />
                </div>
              ))}
            </div>
            <h2 id="add-collection-title" className="text-center text-base font-medium leading-6 text-[#0a0a0a]">
              {title}
            </h2>
          </div>

          <div className="sticky top-0 z-10 flex shrink-0 gap-1 border-b border-[#dfdfe0] bg-white px-8">
            {tabLabels.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => goTo(t)}
                className={`flex h-[26px] items-center justify-center border-b-2 px-1.5 pb-1 pt-0.5 text-sm font-medium leading-5 ${
                  current === t ? "border-primary-500 text-primary-500" : "border-transparent text-ink opacity-60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 px-8 py-3">
            <section id={sectionId(OWNERSHIP_TAB)} className="flex scroll-mt-10 flex-col gap-3">
              <h3 className="text-lg font-medium leading-7 text-ink">{OWNERSHIP_TAB}</h3>
              <div className="flex flex-col justify-center gap-5 rounded-xl border-l-4 border-l-primary-500 bg-[linear-gradient(0deg,rgba(247,231,232,0.3),rgba(247,231,232,0.3)),#fff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[#edd2d3]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M13.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 4v8a1.5 1.5 0 0 0 1.5 1.5H12a1.5 1.5 0 0 0 1.5-1.5v-1.5M2 4.5h10.5A1.5 1.5 0 0 1 14 6v3a1.5 1.5 0 0 1-1.5 1.5H10A1.5 1.5 0 0 1 8.5 9V7A1.5 1.5 0 0 1 10 5.5h4"
                        stroke="#7C3C3F"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10.7" cy="8" r="0.7" fill="#7C3C3F" />
                    </svg>
                  </div>
                  <p className="flex-1 text-xs font-medium leading-4 text-ink">Do you own this coin?</p>
                  <div className="flex gap-2">
                    <OwnChoice label="Yes" selected={ownsCoin} onClick={() => setOwnsCoin(true)} />
                    <OwnChoice label="No" selected={!ownsCoin} onClick={() => setOwnsCoin(false)} />
                  </div>
                </div>

                {ownsCoin && (
                  <>
                    <hr className="border-t-[0.5px] border-[#dfdfe0]" />
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <label className="flex min-w-0 flex-1 flex-col gap-2">
                          <span className="text-xs font-medium leading-4 text-ink">Date acquired</span>
                          <input
                            type="text"
                            value={dateAcquired}
                            placeholder="Enter the date of acquirement"
                            onFocus={(e) => (e.currentTarget.type = "date")}
                            onBlur={(e) => {
                              if (!e.currentTarget.value) e.currentTarget.type = "text";
                            }}
                            onChange={(e) => setDateAcquired(e.target.value)}
                            className={inputCls}
                          />
                        </label>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <span className="text-xs font-medium leading-4 text-ink">Purchase Price</span>
                          <div className="flex gap-2">
                            <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-light text-ink">
                              $
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              value={purchasePrice}
                              onChange={(e) => setPurchasePrice(e.target.value)}
                              aria-label="Purchase price"
                              className={`${inputCls} min-w-0 flex-1 text-[#606062]`}
                            />
                          </div>
                        </div>
                      </div>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-medium leading-4 text-ink">Notes</span>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes"
                          className="h-16 w-full resize-y rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-2 text-xs leading-4 text-ink placeholder:text-[#a4a4a7]"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section id={sectionId("Overview")} className="flex scroll-mt-10 flex-col gap-3">
              <h3 className="text-lg font-medium leading-7 text-ink">Overview</h3>
              <RowTable rows={overview} />
            </section>

            {detail.map((t) => (
              <section key={t.label} id={sectionId(t.label)} className="flex scroll-mt-10 flex-col gap-3">
                <h3 className="text-lg font-medium leading-7 text-ink">{t.label}</h3>
                {t.groups.map((g) => (
                  <div key={g.heading} className="flex flex-col">
                    <p className="px-5 py-2 text-sm font-medium leading-5 text-ink">{g.heading}</p>
                    <RowTable rows={g.rows} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#e5e5e5] px-14 py-4">
          <button
            type="button"
            onClick={() =>
              onConfirmAdd(
                ownsCoin
                  ? { isOwned: true, dateAcquired, purchasePrice, notes: notes.trim() }
                  : { isOwned: false },
              )
            }
            className="flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white"
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
  selectedIds,
  onToggle,
  onClose,
  onDone,
  onCreateCollection,
  saving,
}: {
  open: boolean;
  collections: UserCollectionOption[];
  loading: boolean;
  /** Multi-select. false: Owned disabled. true: Owned locked checked (cannot be unchecked). */
  userOwnsCoin: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
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
    if (creating) return false;
    if (!name) {
      setCreateError("Enter a collection name.");
      return false;
    }
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
        <ul className="flex flex-col">
            {collections.map((opt) => {
              const ownedLocked = userOwnsCoin && opt.kind === "owned";
              const checked = selectedIds.includes(opt.id) || ownedLocked;
              const rowDisabled = !userOwnsCoin && opt.kind === "owned";
              const toggle = () => {
                if (rowDisabled || ownedLocked) return;
                onToggle(opt.id);
              };
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    disabled={rowDisabled}
                    aria-disabled={rowDisabled || ownedLocked}
                    aria-checked={checked}
                    role="checkbox"
                    onClick={toggle}
                    className={`flex w-full items-start gap-2 p-3 text-left text-sm font-medium text-[#606062] ${
                      rowDisabled ? "cursor-not-allowed opacity-50" : ownedLocked ? "cursor-default" : "hover:bg-[#fafafa]"
                    }`}
                  >
                    <CollectionCheckbox checked={checked} disabled={rowDisabled} />
                    <span className="leading-5">{opt.label}</span>
                  </button>
                </li>
              );
            })}
        </ul>
        {loading && <p className="-mt-2 px-3 text-xs text-muted">Loading your collections…</p>}

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
                  maxLength={MAX_COLLECTION_NAME_LENGTH}
                  onChange={(e) => {
                    setNewName(e.target.value.slice(0, MAX_COLLECTION_NAME_LENGTH));
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
          disabled={loading || saving || creating || (createOpen && !newName.trim())}
          className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving || creating ? "Saving…" : "Done"}
        </button>
      </div>
    </dialog>
  );
}
