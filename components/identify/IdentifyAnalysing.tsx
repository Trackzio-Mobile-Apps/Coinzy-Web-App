"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STEPS = [
  "Processing image",
  "Analysing details",
  "Identifying coins",
  "Finalising results",
] as const;

export function IdentifyAnalysing({
  frontPreview,
  backPreview,
}: {
  frontPreview: string;
  backPreview: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers = [0, 1, 2, 3].map((i) => window.setTimeout(() => setActive(i), i * 1600));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl border border-[#efefef] bg-white p-4">
      <h2 className="text-base font-medium leading-6 text-ink">AI Analysis in progress.</h2>
      <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col gap-3">
          <div className="relative size-[120px] overflow-hidden rounded-lg border border-[#efefef] bg-[#f5f5f5] shadow-sm">
            <Image src={frontPreview} alt="Obverse" fill className="object-cover" unoptimized />
          </div>
          <div className="relative size-[120px] overflow-hidden rounded-lg border border-[#efefef] bg-[#f5f5f5] shadow-sm">
            <Image src={backPreview} alt="Reverse" fill className="object-cover" unoptimized />
          </div>
        </div>
        <ol className="relative flex flex-1 flex-col gap-0 py-1">
          {STEPS.map((label, i) => {
            const done = i < active;
            const current = i === active;
            const pending = i > active;
            return (
              <li key={label} className="relative flex gap-4 pb-8 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${done ? "bg-ink" : "bg-[#dfdfe0]"}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    done || current ? "bg-ink text-white" : "border border-[#dfdfe0] bg-white text-[#87878a]"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={`text-sm leading-5 ${
                      pending ? "text-[#87878a]" : current ? "font-medium text-ink" : "text-ink"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
