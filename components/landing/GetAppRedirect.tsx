"use client";

import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as a Mac with touch support.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** Detects iOS / Android on the phone and opens the matching store; desktop keeps both buttons. */
export function GetAppRedirect({ appName = "Coinzy AI", appStoreHref = APP_STORE_URL, playHref = PLAY_STORE_URL }: {
  appName?: string;
  appStoreHref?: string | null;
  playHref?: string;
}) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const store = {
    ios: appStoreHref ? { url: appStoreHref, label: "the App Store" } : null,
    android: { url: playHref, label: "Google Play" },
  };

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    const target = detected === "ios" ? appStoreHref : detected === "android" ? playHref : null;
    if (target) window.location.replace(target);
  }, [appStoreHref, playHref]);

  const target = platform && platform !== "other" ? store[platform] : null;

  return (
    <p className="text-base leading-6 text-muted" role="status">
      {target ? `Opening ${target.label}…` : platform === "ios" ? `${appName} is not available on the App Store yet.` : platform === "other" ? `Choose your store to download ${appName}.` : " "}
    </p>
  );
}
