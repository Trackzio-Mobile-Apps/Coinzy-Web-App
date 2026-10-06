"use client";

import { useState } from "react";
import { IDENTIFY_DEBUG_SAMPLE, loadIdentifyDebugSample } from "@/lib/identify/debugSamples";

export function IdentifyDebugBar({
  onLoad,
}: {
  onLoad: (files: { obverse: File; reverse: File }) => void;
}) {
  const [loading, setLoading] = useState(false);

  if (process.env.NODE_ENV === "production") return null;

  const load = async () => {
    setLoading(true);
    try {
      onLoad(await loadIdentifyDebugSample());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#c4b5fd] bg-[#f5f3ff] px-4 py-3 text-sm">
      <span className="font-medium text-[#5b21b6]">Debug</span>
      <span className="text-muted">{IDENTIFY_DEBUG_SAMPLE.label}</span>
      <button
        type="button"
        disabled={loading}
        onClick={load}
        className="rounded-[10px] border border-[#7c3c3f]/30 bg-white px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50"
      >
        {loading ? "Loading…" : "Load sample photos"}
      </button>
      <span className="text-xs text-muted">or open <code className="text-[#5b21b6]">/identify?debug=1</code></span>
    </div>
  );
}
