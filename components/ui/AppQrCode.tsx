"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

/** Each deployed site uses its own app-download landing page. */
export const APP_QR_SRC = "/assets/coin-details/qr-coinzy.svg";
export const APP_QA_QR_SRC = "/assets/coin-details/qr-coinzy-qa.svg";

export function appQrSourceForHostname(hostname: string): string {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === "coinzy-web-qa.netlify.app" || host.endsWith("--coinzy-web-qa.netlify.app") ? APP_QA_QR_SRC : APP_QR_SRC;
}

const subscribe = () => () => {};
const readSource = () => appQrSourceForHostname(window.location.hostname);
const serverSource = () => null;

export function AppQrCode({ size = 142, className = "" }: { size?: number; className?: string }) {
  const src = useSyncExternalStore(subscribe, readSource, serverSource);
  // Do not briefly render a production QR while the QA page is hydrating.
  if (!src) return <span role="img" aria-label="Loading app download QR code" className={className} style={{ width: size, height: size }} />;
  return (
    <Image
      src={src}
      alt="QR code to download the Coinzy AI app"
      width={size}
      height={size}
      className={className}
    />
  );
}
