"use client";

import { useState } from "react";
import {
  EXPERTS_DEBUG_SAMPLE,
  loadExpertsBlankDebugSample,
  loadExpertsDebugSample,
  loadExpertsDebugVideo,
} from "@/lib/experts/debugSamples";

export type ExpertsDebugMedia = {
  obverse: File;
  reverse: File;
  edge: File;
  video?: File | null;
};

/**
 * Dev-only controls for `/experts/new` — mirrors identify `IdentifyDebugBar`.
 */
export function ExpertDebugBar({ onLoad }: { onLoad: (media: ExpertsDebugMedia) => void }) {
  const [loading, setLoading] = useState<"sample" | "blank" | "video" | null>(null);

  if (process.env.NODE_ENV === "production") return null;

  const run = async (kind: "sample" | "blank" | "video", fn: () => Promise<ExpertsDebugMedia>) => {
    setLoading(kind);
    try {
      onLoad(await fn());
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#c4b5fd] bg-[#f5f3ff] px-4 py-3 text-sm">
      <span className="font-medium text-[#5b21b6]">Debug</span>
      <span className="text-muted">{EXPERTS_DEBUG_SAMPLE.label}</span>
      <button
        type="button"
        disabled={!!loading}
        onClick={() =>
          run("sample", async () => {
            const photos = await loadExpertsDebugSample();
            return { ...photos, video: null };
          })
        }
        className="rounded-[10px] border border-[#7c3c3f]/30 bg-white px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50"
      >
        {loading === "sample" ? "Loading…" : "Load sample photos"}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() =>
          run("blank", async () => {
            const photos = await loadExpertsBlankDebugSample();
            return { ...photos, video: null };
          })
        }
        className="rounded-[10px] border border-[#7c3c3f]/30 bg-white px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50"
      >
        {loading === "blank" ? "Loading…" : "Load black / fake images"}
      </button>
      <button
        type="button"
        disabled={!!loading}
        onClick={() =>
          run("video", async () => {
            const [photos, video] = await Promise.all([
              loadExpertsBlankDebugSample(),
              loadExpertsDebugVideo(),
            ]);
            return { ...photos, video };
          })
        }
        className="rounded-[10px] border border-[#7c3c3f]/30 bg-white px-3 py-1.5 text-xs font-medium text-ink disabled:opacity-50"
      >
        {loading === "video" ? "Loading…" : "Load fake images + video"}
      </button>
    </div>
  );
}
