"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { CollectionCoinRail } from "@/components/collection/CollectionCoinRail";
import { CollectionDetailsSellBar } from "@/components/collection/CollectionDetailsSellBar";
import { CollectionSellDrawer, type SellFilterOptions } from "@/components/collection/CollectionSellDrawer";
import { IdentifySuccessToast } from "@/components/identify/IdentifySuccessToast";
import { IdentifyToast } from "@/components/identify/IdentifyToast";
import type { buildSellPayload } from "@/lib/marketplace/sellForm";

const sellBtn =
  "inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600";

export function CollectionAddForSaleTrigger({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`${sellBtn} ${className}`}>
      Add for Sale
    </button>
  );
}

/** Sell drawer, toasts, rail footer, and sticky bar — Figma `1349:128590`–`1349:142656`. */
export function CollectionCoinSellActions({
  coinId,
  coinTitle,
  sellerName,
  sellerEmail,
  filterOptions,
  listingId,
  listedSellerPanel,
  databaseImages,
  title,
  children,
}: {
  coinId: string;
  coinTitle: string;
  sellerName: string;
  sellerEmail: string;
  filterOptions: SellFilterOptions;
  listingId?: string | null;
  listedSellerPanel?: ReactNode;
  databaseImages: string[];
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listed = Boolean(listingId);

  const submit = async (payload: ReturnType<typeof buildSellPayload>) => {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/marketplace/sell/private/${coinId}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { error?: boolean; reason?: string };
    setSubmitting(false);
    if (!res.ok || json.error) {
      setOpen(false);
      setError(json.reason ?? "Something went wrong while adding the coin to list. Please try again.");
      return;
    }
    setOpen(false);
    setSuccess(true);
    router.refresh();
  };

  const railFooter = listed ? listedSellerPanel : <CollectionAddForSaleTrigger onClick={() => setOpen(true)} />;

  return (
    <>
      <div className="mt-10 flex flex-col items-start gap-4 pb-24 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">{children}</div>
        <CollectionCoinRail databaseImages={databaseImages} title={title} footer={railFooter} />
      </div>

      {!listed && (
        <CollectionDetailsSellBar>
          <CollectionAddForSaleTrigger onClick={() => setOpen(true)} />
        </CollectionDetailsSellBar>
      )}

      <CollectionSellDrawer
        open={open}
        coinTitle={coinTitle}
        sellerName={sellerName}
        defaultEmail={sellerEmail}
        filterOptions={filterOptions}
        submitting={submitting}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      />

      {success && (
        <IdentifySuccessToast
          title="Your coin has been added for sale!"
          body="The coin has been successfully added for sale."
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <IdentifyToast title="Coin listing failed!" body={error} onClose={() => setError(null)} />
      )}
    </>
  );
}
