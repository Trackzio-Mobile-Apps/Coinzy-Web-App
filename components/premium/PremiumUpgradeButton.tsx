"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PremiumSubscribeDialog } from "@/components/premium/PremiumSubscribeDialog";

/** Opens the mobile-app Premium subscribe dialog (no web checkout). */
export function PremiumUpgradeButton({
  className,
  children,
  openOnHash = false,
}: {
  className?: string;
  children: ReactNode;
  /** When true, also open if the URL hash is `#premium` (home banner deep link). */
  openOnHash?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!openOnHash) return;
    const maybeOpen = () => {
      if (window.location.hash === "#premium") setOpen(true);
    };
    maybeOpen();
    window.addEventListener("hashchange", maybeOpen);
    return () => window.removeEventListener("hashchange", maybeOpen);
  }, [openOnHash]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <PremiumSubscribeDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
