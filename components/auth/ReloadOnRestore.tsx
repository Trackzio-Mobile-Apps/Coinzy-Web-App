"use client";

import { useEffect } from "react";

/**
 * Safari/Firefox may restore a page from the back/forward cache with its old DOM. Pages whose content depends on
 * the session cookie (`/`, `/auth`, `/home`) must re-ask the server in that case — signed-in users get redirected
 * off the auth screens, signed-out users off `/home`. Renders nothing.
 */
export function ReloadOnRestore() {
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  return null;
}
