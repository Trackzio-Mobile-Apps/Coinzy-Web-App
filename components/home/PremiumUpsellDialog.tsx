"use client";

import { PremiumSubscribeDialog } from "@/components/premium/PremiumSubscribeDialog";

/** Coin of the Day opens the shared Premium download dialog directly. */
export function PremiumUpsellDialog({ open, onClose, email }: { open: boolean; onClose: () => void; email?: string }) {
  return <PremiumSubscribeDialog open={open} onClose={onClose} email={email} coinOfTheDay />;
}
