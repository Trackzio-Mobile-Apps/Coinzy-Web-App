"use client";

import { PremiumSubscribeDialog } from "@/components/premium/PremiumSubscribeDialog";
import { useExpertsAccountEmail } from "@/components/experts/ExpertsPayContext";

export function ExpertsBuyCreditsDialog({ open, onClose, onPurchased }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onPurchased?: (creditBalance: number) => void;
}) {
  const email = useExpertsAccountEmail();
  return <PremiumSubscribeDialog open={open} onClose={onClose} email={email} credits onCreditsChecked={onPurchased} />;
}
