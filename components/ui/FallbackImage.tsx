"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type ReactNode } from "react";

/**
 * `next/image` that swaps to `fallback` when the image fails (broken S3 link, optimizer 4xx/5xx).
 * next/image re-triggers errors that happened before hydration, so SSR'd failures are caught too.
 */
export function FallbackImage({ fallback, onError, ...props }: ImageProps & { fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  // Reset when the source changes (e.g. client navigation reusing the component).
  const [src, setSrc] = useState(props.src);
  if (src !== props.src) {
    setSrc(props.src);
    setFailed(false);
  }
  if (failed) return <>{fallback}</>;
  return (
    <Image
      {...props}
      alt={props.alt}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
    />
  );
}
