"use client";

import { useEffect, useState } from "react";
import { ExpertsHub } from "@/components/experts/ExpertsHub";
import { resolveExpertsCreditBalance } from "@/lib/experts/creditBalance";
import { getExpertsCredits, getExpertsProfile } from "@/lib/experts/client";
import type { ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";

/** SSR credit + client refresh so hub matches latest Experts wallet (same as mobile). */
export function ExpertsHubLive({
  initialCreditBalance,
  requests,
  experts,
}: {
  initialCreditBalance: number;
  requests: ExpertRequest[];
  experts: ExpertsDirectoryItem[];
}) {
  const [creditBalance, setCreditBalance] = useState(initialCreditBalance);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getExpertsCredits(), getExpertsProfile()]).then(([credits, profile]) => {
      if (cancelled) return;
      setCreditBalance(
        resolveExpertsCreditBalance(
          credits.error ? null : credits.data,
          profile.error ? null : profile.data?.user,
          initialCreditBalance,
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [initialCreditBalance]);

  return (
    <ExpertsHub requests={requests} creditBalance={creditBalance} experts={experts} />
  );
}
