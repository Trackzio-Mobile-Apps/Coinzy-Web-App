"use client";

import { useCallback, useEffect, useState } from "react";
import { ReportReadyView } from "@/components/experts/ReportReadyView";
import { creditBalanceFromData, parseCreditBalance } from "@/lib/experts/creditBalance";
import { getExpertsCredits } from "@/lib/experts/client";
import type { ExpertsRealtimeMessage } from "@/lib/experts/realtime";
import { useExpertsRealtime } from "@/lib/experts/useExpertsRealtime";
import type { ExpertReport, ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";

/** Completed report — Figma other cases `1038:159962`. */
export function ExpertReportPanel({
  request,
  report,
  creditBalance: initialCredits,
  experts,
  preview = false,
}: {
  request: ExpertRequest;
  report: ExpertReport;
  creditBalance: number;
  experts: ExpertsDirectoryItem[];
  preview?: boolean;
}) {
  const [credits, setCredits] = useState(initialCredits);
  useEffect(() => {
    if (preview) return;
    void getExpertsCredits().then((res) => {
      if (!res.error) setCredits(creditBalanceFromData(res.data, initialCredits));
    });
  }, [initialCredits, preview]);
  const onRealtime = useCallback((message: ExpertsRealtimeMessage) => {
    if (message.event !== "credit.updated") return;
    const fromEvent = parseCreditBalance(message.creditBalance);
    if (fromEvent !== null) {
      setCredits(fromEvent);
      return;
    }
    void getExpertsCredits().then((res) => {
      if (!res.error) {
        const n = parseCreditBalance(res.data?.creditBalance);
        if (n !== null) setCredits(n);
      }
    });
  }, []);
  useExpertsRealtime(onRealtime);

  return <ReportReadyView request={request} report={report} creditBalance={credits} onCreditsPurchased={setCredits} preview={preview} experts={experts} />;
}
