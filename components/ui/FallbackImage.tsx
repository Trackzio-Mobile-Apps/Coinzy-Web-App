"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

/**
 * `next/image` that tries optional alternate photos, then swaps to `fallback` on failure.
 * next/image re-triggers errors that happened before hydration, so SSR'd failures are caught too.
 */
export function FallbackImage({ fallback, fallbackSources = [], onError, ...props }: ImageProps & { fallback: ReactNode; fallbackSources?: string[] }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Reset when the source changes (e.g. client navigation reusing the component).
  const [src, setSrc] = useState(props.src);
  if (src !== props.src) {
    setSrc(props.src);
    setFailed(false);
    setAttempt(0);
  }
  if (failed) return <>{fallback}</>;
  return (
    <Image
      {...props}
      src={attempt === 0 ? props.src : fallbackSources[attempt - 1]}
      alt={props.alt}
      onError={(e) => {
        if (attempt < fallbackSources.length) {
          setAttempt(attempt + 1);
          return;
        }
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
