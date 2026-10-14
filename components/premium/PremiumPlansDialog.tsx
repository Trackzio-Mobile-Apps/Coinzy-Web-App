"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import {
  DEFAULT_PREMIUM_PLAN_ID,
  PREMIUM_PLANS,
  type PremiumPlan,
} from "@/lib/premium/plans";

const A = "/assets/home";
const PACK_GRADIENT =
  "linear-gradient(-77.5deg, rgb(106, 101, 237) 10.1%, rgb(229, 74, 159) 98.5%)";

/**
 * Test Premium plans modal — pick a plan and “purchase” (sets `coinzy_premium` cookie).
 * No real payment; replace when Payments task 20 ships.
 */
export function PremiumPlansDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const router = useRouter();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const [selected, setSelected] = useState(DEFAULT_PREMIUM_PLAN_ID);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const plan = PREMIUM_PLANS.find((p) => p.id === selected) ?? PREMIUM_PLANS[1];

  const purchase = () => {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/premium/test-purchase", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.id }),
        });
        const json = (await res.json()) as { error?: boolean; message?: string | null };
        if (!res.ok || json.error) {
          setError(json.message || "Could not activate Premium.");
          return;
        }
        onClose();
        router.refresh();
      } catch {
        setError("Could not activate Premium.");
      }
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
      className="m-auto w-[400px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-3 p-5" style={{ backgroundImage: PACK_GRADIENT }}>
        <Image src={`${A}/premium-crown.svg`} alt="" width={48} height={48} />
        <div className="space-y-1 pr-6">
          <h2 id={titleId} className="text-xl font-medium leading-7 text-white">
            Choose a Premium plan
          </h2>
          <p className="text-sm leading-5 text-white/90">
            Test purchase only — no card charged. Picks unlock Premium on this device until real payments ship.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Image src={`${A}/icon-close-white.svg`} alt="" width={16} height={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <ul className="flex flex-col gap-2" role="listbox" aria-label="Premium plans">
          {PREMIUM_PLANS.map((p) => (
            <PlanOption
              key={p.id}
              plan={p}
              selected={selected === p.id}
              onSelect={() => setSelected(p.id)}
            />
          ))}
        </ul>

        {error ? (
          <p className="text-xs text-[#dc2626]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={pending}
          onClick={purchase}
          className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#6a65ed_0%,#e54a9f_100%)] px-6 text-base font-medium text-white disabled:opacity-60"
        >
          {pending ? "Activating…" : `Get Premium · ${plan.priceLabel}`}
        </button>
        <p className="text-center text-[11px] leading-4 text-muted">
          Interim test checkout · no payment processor
        </p>
      </div>
    </dialog>
  );
}

function PlanOption({
  plan,
  selected,
  onSelect,
}: {
  plan: PremiumPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
          selected
            ? "border-primary-500 bg-primary-50"
            : "border-[#e5e5e5] bg-white hover:border-[#d4d4d4]"
        }`}
      >
        <div className="min-w-0 space-y-0.5">
          <p className="flex items-center gap-2 text-sm font-medium leading-5 text-ink">
            {plan.label}
            {plan.popular ? (
              <span className="rounded-full bg-[linear-gradient(90deg,#6a65ed,#e54a9f)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Popular
              </span>
            ) : null}
          </p>
          <p className="text-xs leading-4 text-muted">{plan.detail}</p>
        </div>
        <span className="shrink-0 text-sm font-bold leading-5 text-ink">{plan.priceLabel}</span>
      </button>
    </li>
  );
}
