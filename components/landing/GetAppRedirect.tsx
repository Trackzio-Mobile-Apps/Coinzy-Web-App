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

const STORE = {
  ios: { url: APP_STORE_URL, label: "the App Store" },
  android: { url: PLAY_STORE_URL, label: "Google Play" },
} as const;

/** Detects iOS / Android on the phone and opens the matching store; desktop keeps both buttons. */
export function GetAppRedirect() {
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (detected !== "other") window.location.replace(STORE[detected].url);
  }, []);

  const target = platform && platform !== "other" ? STORE[platform] : null;

  return (
    <p className="text-base leading-6 text-muted" role="status">
      {target ? `Opening ${target.label}…` : platform === "other" ? "Choose your store to download Coinzy AI." : " "}
    </p>
  );
}
