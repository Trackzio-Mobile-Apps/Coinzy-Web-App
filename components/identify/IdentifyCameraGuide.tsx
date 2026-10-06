"use client";

import { useId } from "react";

/** Figma `1248:154298` — 240px coin guide (circle + corner brackets + grid) over the camera viewport. */
export function IdentifyCameraGuide({ className = "" }: { className?: string }) {
  const maskId = useId();
  const cx = 270;
  const cy = 210;
  const r = 120;
  const bracket = 36;
  const inner = r - 8;

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
      </defs>
      <rect width="540" height="420" fill="rgba(0,0,0,0.52)" mask={`url(#${maskId})`} />
      <circle cx={cx} cy={cy} r={r} stroke="white" strokeWidth="1.5" strokeOpacity="0.95" />
      {[ -1, 0, 1 ].map((i) => (
        <line
          key={`v${i}`}
          x1={cx + (i * inner) / 2}
          y1={cy - inner}
          x2={cx + (i * inner) / 2}
          y2={cy + inner}
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {[ -1, 0, 1 ].map((i) => (
        <line
          key={`h${i}`}
          x1={cx - inner}
          y1={cy + (i * inner) / 2}
          x2={cx + inner}
          y2={cy + (i * inner) / 2}
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {(
        [
          [cx - inner, cy - inner, 1, 1],
          [cx + inner, cy - inner, -1, 1],
          [cx - inner, cy + inner, 1, -1],
          [cx + inner, cy + inner, -1, -1],
        ] as const
      ).map(([x, y, sx, sy], idx) => (
        <path
          key={idx}
          d={`M${x + sx * bracket} ${y} H${x} V${y + sy * bracket}`}
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
