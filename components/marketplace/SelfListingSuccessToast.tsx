"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IdentifySuccessToast } from "@/components/identify/IdentifySuccessToast";
import { selfListingPath } from "@/lib/marketplace/selfListing";

/** One-shot success toast after Add for Sale → self listing (`?listed=1`). Figma `1363:178858` Toast. */
export function SelfListingSuccessToast({ listingId, show }: { listingId: string; show: boolean }) {
  const router = useRouter();
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    router.replace(selfListingPath(listingId), { scroll: false });
  };

  return (
    <IdentifySuccessToast
      title="Coin listing successful."
      body="Your coins has been added to the marketplace."
      onClose={dismiss}
    />
  );
}
