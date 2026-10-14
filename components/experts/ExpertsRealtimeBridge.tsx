"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExpertsRealtime } from "@/lib/experts/useExpertsRealtime";
import { isRequestLifecycleEvent, type ExpertsRealtimeMessage } from "@/lib/experts/realtime";

/**
 * Shell-level Socket.IO → `router.refresh()` so server-rendered Experts pages
 * re-fetch REST (hub list, credits, status props). Panels with local state also
 * subscribe via `useExpertsRealtime` for immediate updates.
 */
export function ExpertsRealtimeBridge() {
  const router = useRouter();

  const onEvent = useCallback(
    (message: ExpertsRealtimeMessage) => {
      if (message.event === "credit.updated" || isRequestLifecycleEvent(message.event)) {
        router.refresh();
      }
    },
    [router],
  );

  useExpertsRealtime(onEvent);

  return null;
}
