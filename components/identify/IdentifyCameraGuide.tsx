"use client";

import { useId } from "react";

/** Figma `1248:154298` — 240px coin guide (circle + corner brackets + grid) over the camera viewport. */
export function IdentifyCameraGuide({ className = "" }: { className?: string }) {
  const maskId = useId();
  const clipId = useId();
  const cx = 270;
  const cy = 210;
  const r = 120;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
      viewBox="0 0 540 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <mask id={maskId}>
          <rect width="540" height="420" fill="white" />
          <circle cx={cx} cy={cy} r={r} fill="black" />
        </mask>
        <clipPath id={clipId}><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      <rect width="540" height="420" fill="rgba(0,0,0,0.52)" mask={`url(#${maskId})`} />
      <g clipPath={`url(#${clipId})`}>
      {[ -1.5, -0.5, 0.5, 1.5 ].map((i) => (
        <line
          key={`v${i}`}
          x1={cx + i * 48}
          y1={cy - r}
          x2={cx + i * 48}
          y2={cy + r}
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {[ -1.5, -0.5, 0.5, 1.5 ].map((i) => (
        <line
          key={`h${i}`}
          x1={cx - r}
          y1={cy + i * 48}
          x2={cx + r}
          y2={cy + i * 48}
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      </g>
      <path d={`M${cx - 36} ${cy - r}h72 M${cx - 36} ${cy + r}h72 M${cx - r} ${cy - 36}v72 M${cx + r} ${cy - 36}v72`} stroke="white" strokeWidth="3" />
    </svg>
  );
}
