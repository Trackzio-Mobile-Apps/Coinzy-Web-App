"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ExpertsBuyCreditsDialog } from "@/components/experts/ExpertsBuyCreditsDialog";

type Variant = "primary" | "outline";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex h-9 items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700",
  outline:
    "flex h-9 w-full items-center justify-center rounded-[10px] border border-primary-500 bg-white text-sm font-medium text-primary-500 hover:bg-primary-50",
};

/**
 * Opens Figma `1500:289177` buy-credits dialog (Play Store stub until web IAP exists).
 * @trackzio.com sessions get staff dummy pay instead of Play Store.
 */
export function BuyCreditsButton({
  className,
  variant = "primary",
  children = "Buy credits",
  title,
  subtitle,
  onPurchased,
}: {
  className?: string;
  variant?: Variant;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  onPurchased?: (creditBalance: number) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? VARIANT_CLASS[variant]}
      >
        {children}
      </button>
      <ExpertsBuyCreditsDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        subtitle={subtitle}
        onPurchased={(balance) => {
          onPurchased?.(balance);
          router.refresh();
        }}
      />
    </>
  );
}
