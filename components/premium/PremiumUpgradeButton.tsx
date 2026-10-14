"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PremiumPlansDialog } from "@/components/premium/PremiumPlansDialog";

/**
 * Opens the test Premium plans dialog. Use anywhere “Go Premium” / Subscribe used to link `#premium`.
 */
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
      <PremiumPlansDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
