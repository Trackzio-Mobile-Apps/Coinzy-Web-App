"use client";

import { useEffect, useState } from "react";

/** Countdown pill for the premium banner (Figma shows Ends in HH:MM:SS). */
export function PremiumCountdown({ hours = 0, minutes = 14, seconds = 32 }: { hours?: number; minutes?: number; seconds?: number }) {
  const [left, setLeft] = useState(hours * 3600 + minutes * 60 + seconds);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [left]);

  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-4 py-1 text-sm text-primary-500">
      <span className="font-semibold leading-5">50% off</span>
      <span className="font-medium leading-5">•</span>
      <span className="font-medium leading-5 tabular-nums">Ends in {h}:{m}:{s}</span>
    </span>
  );
}
