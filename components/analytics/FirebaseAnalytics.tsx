"use client";

import { useEffect } from "react";
import { getFirebaseApp } from "@/lib/firebase/client";

export function FirebaseAnalytics() {
  useEffect(() => {
    void import("firebase/analytics")
      .then(async ({ getAnalytics, isSupported }) => {
        if (await isSupported()) getAnalytics(getFirebaseApp());
      })
      .catch(() => {
        // Analytics must not prevent the site from working when blocked.
      });
  }, []);

  return null;
}
