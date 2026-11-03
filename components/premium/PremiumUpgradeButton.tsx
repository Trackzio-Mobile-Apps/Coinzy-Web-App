"use client";

import { useState, type ReactNode } from "react";
import { PremiumSubscribeDialog } from "@/components/premium/PremiumSubscribeDialog";

/** Opens the mobile-app Premium subscribe dialog (no web checkout). */
export function PremiumUpgradeButton({
  className,
  children,
  headerStyle = false,
  email,
  scanUsage,
  catalogueDetails = false,
  collectionLimit = false,
}: {
  className?: string;
  children: ReactNode;
  headerStyle?: boolean;
  email?: string;
  scanUsage?: { used: number; limit: number };
  catalogueDetails?: boolean;
  collectionLimit?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <PremiumSubscribeDialog open={open} onClose={() => setOpen(false)} headerStyle={headerStyle} email={email} scanUsage={scanUsage} catalogueDetails={catalogueDetails} collectionLimit={collectionLimit} />
    </>
  );
}
