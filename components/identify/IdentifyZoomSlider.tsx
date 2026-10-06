"use client";

/** Figma slider in capture modal footer — 240px track, wine filled bar `#7c3c3f`. */
export function IdentifyZoomSlider({
  value,
  onChange,
}: {
  /** 0–100 */
  value: number;
  onChange: (value: number) => void;
}) {
  const zoomLabel = zoomFromSlider(value);

  return (
    <div className="w-full max-w-[240px] shrink-0">
      <div className="mb-3 flex items-center justify-between text-sm leading-5">
        <span className="font-medium text-ink">Zoom</span>
        <span className="text-right text-muted opacity-80">{zoomLabel}</span>
      </div>
      <div className="relative h-[6px] w-full rounded-full bg-[#dfdfe0]">
        <div
          className="absolute left-0 top-0 h-full rounded-l-full bg-[#7c3c3f] border border-[#171717]"
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Zoom"
          className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 rounded-full border border-[#a3a3a3] bg-white shadow-sm"
          style={{ left: `calc(${value}% - 6px)` }}
        />
      </div>
    </div>
  );
}

/** Maps slider 0–100 → 1x–5x (Figma default ~50% ≈ 3x). */
export function zoomFromSlider(value: number): string {
  const zoom = 1 + (value / 100) * 4;
  const rounded = Math.round(zoom * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}x`;
}

export function zoomScaleFromSlider(value: number): number {
  return 1 + (value / 100) * 4;
}
