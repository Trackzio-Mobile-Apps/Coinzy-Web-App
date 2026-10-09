"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";

const A = "/assets/marketplace";

export type OwnedCoinPick = {
  coinId: string;
  name: string;
  imageUrls: string[];
};

type OwnedCoinRow = {
  coinId: string;
  name: string;
  imageUrls?: string[];
};

/**
 * "Select from your owned collection" — Figma Copy `1362:171575` modal (572×604).
 * Loads owned coins via `POST /api/coin/fetchAll` with `{ isOwned: [true] }`.
 */
export function SelectOwnedCoinDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (coin: OwnedCoinPick) => void;
}) {
  const titleId = useId();
  const searchId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [coins, setCoins] = useState<OwnedCoinRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDebounced("");
    setSelectedId(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ pageNo: "0", pageSize: "40" });
      if (search) qs.set("search", search);
      const res = await fetch(`/api/coin/fetchAll?${qs}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOwned: [true] }),
        cache: "no-store",
      });
      const json = (await res.json()) as {
        error?: boolean;
        reason?: string;
        data?: OwnedCoinRow[];
      };
      if (!res.ok || json.error) {
        setCoins([]);
        setError(json.reason ?? "Could not load owned coins.");
        return;
      }
      setCoins(json.data ?? []);
    } catch {
      setCoins([]);
      setError("Could not load owned coins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load(debounced);
  }, [open, debounced, load]);

  const selected = coins.find((c) => c.coinId === selectedId);

  const confirm = () => {
    if (!selected) return;
    onConfirm({
      coinId: selected.coinId,
      name: selected.name,
      imageUrls: selected.imageUrls ?? [],
    });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // Do not put `flex` on <dialog> — it overrides UA `dialog:not([open]) { display: none }`,
      // leaving a non-modal ghost panel with no ::backdrop and an unpainted white fill.
      className="m-auto h-[min(604px,calc(100%-32px))] w-[572px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <div className="relative flex shrink-0 flex-col gap-3 p-4">
          <h2 id={titleId} className="pr-8 text-base font-medium leading-6 text-ink">
            Select from your owned collection
          </h2>
          <label htmlFor={searchId} className="sr-only">
            Search owned coins
          </label>
          <div className="flex h-8 items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white px-2">
            <Image src="/assets/catalogue/icon-search.svg" alt="" width={14} height={14} className="size-4" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coins, empires, countries, years…"
              className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-ink outline-none placeholder:text-[#a4a4a7]"
            />
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 pb-4">
          {loading && <p className="py-8 text-center text-sm text-muted">Loading owned coins…</p>}
          {!loading && error && <p className="py-8 text-center text-sm text-[#dc2626]">{error}</p>}
          {!loading && !error && coins.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              {debounced ? "No owned coins match your search." : "You don’t have any owned coins yet."}
            </p>
          )}
          {!loading && !error && coins.length > 0 && (
            <ul className="flex flex-col gap-2" role="listbox" aria-label="Owned coins">
              {coins.map((coin) => {
                const selectedRow = coin.coinId === selectedId;
                const thumbs = (coin.imageUrls ?? []).filter(Boolean).slice(0, 2);
                while (thumbs.length < 2) thumbs.push("");
                return (
                  <li key={coin.coinId}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedRow}
                      onClick={() => setSelectedId(coin.coinId)}
                      className="flex w-full items-center justify-between rounded-[12px] border-[0.5px] border-[#dfdfe0] bg-white px-[12.5px] py-[8.5px] text-left hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        {thumbs.map((src, i) => (
                          <span
                            key={`${coin.coinId}-${i}`}
                            className="flex size-[52px] shrink-0 items-center justify-center rounded-lg bg-[#f5ede0] p-1.5"
                          >
                            {src ? (
                              <span className="relative size-10 overflow-hidden rounded-full">
                                <FallbackImage
                                  src={src}
                                  alt=""
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                  fallback={<CoinPlaceholder size="sm" className="!h-10 !w-10" />}
                                />
                              </span>
                            ) : (
                              <CoinPlaceholder size="sm" className="!h-10 !w-10" />
                            )}
                          </span>
                        ))}
                        <span className="min-w-0 flex-1 text-xs leading-[1.5] text-[#1e1e1f]">{coin.name}</span>
                      </span>
                      <Image
                        src={selectedRow ? `${A}/icon-radio-on.svg` : `${A}/icon-radio-off.svg`}
                        alt=""
                        width={24}
                        height={24}
                        className="ml-2 size-6 shrink-0"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium leading-5 text-ink hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={confirm}
            className="inline-flex h-8 items-center justify-center rounded-[10px] bg-primary-500 px-3 text-sm font-medium leading-5 text-white hover:bg-primary-600 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            List selected coin
          </button>
        </div>
      </div>
    </dialog>
  );
}
