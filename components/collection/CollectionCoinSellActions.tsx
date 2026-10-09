"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CollectionCoinRail } from "@/components/collection/CollectionCoinRail";
import { CollectionDetailsSellBar } from "@/components/collection/CollectionDetailsSellBar";
import { CollectionSellDrawer, type SellFilterOptions } from "@/components/collection/CollectionSellDrawer";
import { IdentifySuccessToast } from "@/components/identify/IdentifySuccessToast";
import { IdentifyToast } from "@/components/identify/IdentifyToast";
import { useSellerProfileGate } from "@/components/marketplace/useSellerProfileGate";
import type { buildSellPayload } from "@/lib/marketplace/sellForm";
import { selfListingPath } from "@/lib/marketplace/selfListing";

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

/**
 * Sell drawer, toasts, rail footer, and sticky bar — Figma `1349:128590`–`1349:142656` / Copy `1363:176354`.
 * Pass `autoOpenSell` (`?list=1` From Owned / List-a-coin) to open after the seller-profile gate.
 * Gates on Set Seller Profile (`1363:172631`) when incomplete.
 * On success navigates to `/marketplace/my-listing/[id]?listed=1`.
 */
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
  autoOpenSell = false,
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
  /** Open the Add for Sale drawer on mount (`?list=1`) after seller profile gate. */
  autoOpenSell?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSeller, setActiveSeller] = useState({ name: sellerName, email: sellerEmail });
  const listed = Boolean(listingId);
  const profileGate = useSellerProfileGate({ personalEmail: sellerEmail, defaultName: sellerName });

  const startSell = async () => {
    const result = await profileGate.ensureSellerProfile();
    if (!result.ok) return;
    const details = result.profile.sellerDetails;
    setActiveSeller({
      name: details.name?.trim() || sellerName,
      email: details.contactEmail?.trim() || sellerEmail,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!autoOpenSell || listed) return;
    void startSell();
    // Only auto-run when From Owned / List-a-coin asks via `?list=1`.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot on autoOpenSell
  }, [autoOpenSell, listed]);

  const submit = async (payload: ReturnType<typeof buildSellPayload>) => {
    setSubmitting(true);
    setError(null);
    const profile = profileGate.sellerProfile?.sellerDetails;
    const body = {
      ...payload,
      sellerDetails: {
        ...payload.sellerDetails,
        name: profile?.name?.trim() || payload.sellerDetails.name,
        contactEmail: payload.sellerDetails.contactEmail || profile?.contactEmail || "",
        location: profile?.location?.trim() || payload.sellerDetails.location || "—",
        phoneNumber: profile?.phoneNumber?.trim() || undefined,
        bio: profile?.bio?.trim() || undefined,
        externalLinks: payload.sellerDetails.externalLinks,
      },
    };
    const res = await fetch(`/api/marketplace/sell/private/${coinId}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      error?: boolean;
      reason?: string;
      data?: { id?: string; listingId?: string };
    };
    setSubmitting(false);
    if (!res.ok || json.error) {
      setOpen(false);
      setError(json.reason ?? "Something went wrong while adding the coin to list. Please try again.");
      return;
    }
    setOpen(false);
    const newId = json.data?.listingId ?? json.data?.id;
    if (newId) {
      router.push(selfListingPath(newId, { listed: true }));
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  const railFooter = listed ? listedSellerPanel : <CollectionAddForSaleTrigger onClick={startSell} />;

  return (
    <>
      <div className="mt-10 flex flex-col items-start gap-4 pb-24 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">{children}</div>
        <CollectionCoinRail databaseImages={databaseImages} title={title} footer={railFooter} />
      </div>

      {!listed && (
        <CollectionDetailsSellBar>
          <CollectionAddForSaleTrigger onClick={startSell} />
        </CollectionDetailsSellBar>
      )}

      {profileGate.profileDialog}

      <CollectionSellDrawer
        open={open}
        coinTitle={coinTitle}
        sellerName={activeSeller.name}
        defaultEmail={activeSeller.email}
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
