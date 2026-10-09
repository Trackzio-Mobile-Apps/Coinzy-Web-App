"use client";

import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { useExpertsDummyPayAllowed } from "@/components/experts/ExpertsPayContext";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { PLAY_STORE_URL } from "@/lib/constants";
import { purchaseDummyCredits } from "@/lib/experts/client";
import {
  DEFAULT_CREDIT_PACK_ID,
  EXPERT_CREDIT_PACKS,
  type ExpertCreditPack,
} from "@/lib/experts/creditPacks";

const A = "/assets/experts";
const PACK_GRADIENT =
  "linear-gradient(-77.5deg, rgb(106, 101, 237) 10.1%, rgb(229, 74, 159) 98.5%)";

const TRUST = [
  {
    title: "Secure Payment",
    body: "Credits added to your wallet Instantly",
    icon: "shield" as const,
  },
  {
    title: "100% Privacy",
    body: "Your coin data & photos stay confidential",
    icon: "lock" as const,
  },
  {
    title: "Expert analysis",
    body: "Reviewed by certified numismatists",
    icon: "check" as const,
  },
] as const;

const TRUST_STROKE = "#7c3c3f";

function TrustIcon({ kind }: { kind: (typeof TRUST)[number]["icon"] }) {
  if (kind === "shield") {
    return (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 13c0 5-3.5 7.5-8 10.5C7.5 20.5 4 18 4 13V6l8-3 8 3v7z"
          stroke={TRUST_STROKE}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "lock") {
    return (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={TRUST_STROKE} strokeWidth={1.75} />
        <path
          d="M8 11V8a4 4 0 0 1 8 0v3"
          stroke={TRUST_STROKE}
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={TRUST_STROKE} strokeWidth={1.75} />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke={TRUST_STROKE}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Buy credits modal — Figma `1500:289177`.
 * Default: Continue opens Play Store. @trackzio.com sessions use staff dummy pay.
 */
export function ExpertsBuyCreditsDialog({
  open,
  onClose,
  title = "You need credits to submit",
  subtitle = "Explore our packs to get the experts evaluation",
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onPurchased?: (creditBalance: number) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const allowDummyPay = useExpertsDummyPayAllowed();
  const [selected, setSelected] = useState(DEFAULT_CREDIT_PACK_ID);
  const [payError, setPayError] = useState("");
  const [pending, startTransition] = useTransition();

  const pack = EXPERT_CREDIT_PACKS.find((p) => p.id === selected) ?? EXPERT_CREDIT_PACKS[1];

  const continuePayment = () => {
    if (!allowDummyPay) {
      const url = `${PLAY_STORE_URL}&referrer=experts_credits_${pack.productId}`;
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    setPayError("");
    startTransition(async () => {
      const res = await purchaseDummyCredits(pack.id);
      if (res.error || typeof res.data?.creditBalance !== "number") {
        setPayError(res.message || "Dummy payment failed.");
        return;
      }
      onPurchased?.(res.data.creditBalance);
      onClose();
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
      className="m-auto w-[572px] max-w-[calc(100%-32px)] overflow-visible rounded-[14px] border-0 bg-transparent p-0 text-ink shadow-none backdrop:bg-black/55"
    >
      <div className="flex max-h-[min(90vh,640px)] flex-col overflow-hidden rounded-[14px] bg-gradient-to-b from-[#fdefe7] to-white to-[62%] shadow-[0_0_0_1px_rgba(10,10,10,0.1)]">
        {/* Header */}
        <div className="relative shrink-0 p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 size-4"
          >
            <Image src={`${A}/icon-close.svg`} alt="" width={16} height={16} unoptimized />
          </button>
          <div className="flex gap-3 pr-5">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="relative size-10 overflow-hidden">
                <Image
                  src={`${A}/credit-badge-coin.webp`}
                  alt=""
                  width={56}
                  height={84}
                  className="absolute left-[-20%] top-[-50%] h-[210%] w-[140%] max-w-none"
                />
              </div>
              <div className="space-y-1">
                <h2 id={titleId} className="text-base font-medium leading-6 text-[#0a0a0a]">
                  {title}
                </h2>
                <p className="text-sm leading-5 text-[#737373]">{subtitle}</p>
              </div>
            </div>
            <div className="relative h-[98px] w-[100px] shrink-0 opacity-80">
              <Image
                src={`${A}/buy-credits-wallet.webp`}
                alt=""
                width={120}
                height={100}
                className="absolute left-[-12%] top-0 h-full w-[120%] max-w-none object-contain"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="flex items-stretch rounded-xl bg-[#f7e7e8] p-4">
            {TRUST.map((item, i) => (
              <div
                key={item.title}
                className={`flex min-w-0 flex-1 flex-col items-center gap-2 px-2 text-center ${
                  i > 0 ? "border-l border-[#e8d5d7]" : ""
                }`}
              >
                <span className="flex size-9 items-center justify-center rounded-lg">
                  <TrustIcon kind={item.icon} />
                </span>
                <div>
                  <p className="text-sm font-medium leading-5 text-[#1e1a1a]">{item.title}</p>
                  <p className="mt-1 text-xs leading-4 text-[#5c5557]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 px-1 py-6 sm:px-5 sm:py-8">
            {EXPERT_CREDIT_PACKS.map((p) => (
              <PackCard
                key={p.id}
                pack={p}
                selected={selected === p.id}
                onSelect={() => setSelected(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 flex-col items-center gap-2 border-t border-[#e5e5e5] p-4"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)",
          }}
        >
          {payError ? (
            <p role="alert" className="w-full text-center text-sm text-[#b91c1c]">
              {payError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={continuePayment}
            disabled={pending}
            className="flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-[#fafafa] hover:bg-primary-700 disabled:opacity-60"
          >
            {pending
              ? "Adding credits…"
              : allowDummyPay
                ? "Continue (dummy pay)"
                : "Continue to payment"}
          </button>
          <p className="text-sm leading-5 text-[#606062]">
            {allowDummyPay
              ? "Staff dummy pay — no charge · 1 credit = 1 expert evaluation"
              : "1 credit = 1 expert evaluation"}
          </p>
        </div>
      </div>
    </dialog>
  );
}

function PackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: ExpertCreditPack;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex h-[156px] min-w-0 flex-1 flex-col justify-between rounded-xl px-4 pb-4 pt-6 text-left text-white ${
        selected ? "border-2 border-primary-500" : "border border-[#c2c2c4]"
      }`}
      style={{ backgroundImage: PACK_GRADIENT }}
    >
      {pack.popular ? (
        <span className="absolute left-1/2 top-[-14px] -translate-x-1/2 whitespace-nowrap rounded-[40px] border border-primary-500 bg-white px-5 text-sm font-medium leading-6 text-primary-500">
          Popular plan
        </span>
      ) : null}
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
              selected ? "border-white bg-white" : "border-white bg-transparent"
            }`}
            aria-hidden
          >
            {selected ? <span className="size-2 rounded-full bg-primary-500" /> : null}
          </span>
          <span className="text-base font-medium leading-6">{pack.label}</span>
        </div>
        <div className="border-b-[0.5px] border-white pb-6 pl-7">
          <span className="text-xl font-medium leading-7">{pack.priceLabel}</span>
        </div>
      </div>
      <p className="px-7 text-center text-xs leading-none text-white">{pack.perCreditLabel}</p>
    </button>
  );
}
