"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Safari/Firefox may restore a page from the back/forward cache with its old DOM. Pages whose content depends on
 * the session cookie (`/`, `/auth`, `/home`) must re-ask the server in that case — signed-in users get redirected
 * off the auth screens (middleware + RSC), signed-out users off `/home`. Renders nothing.
 */
export function ReloadOnRestore({ refreshOnMount = false }: { refreshOnMount?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    // A client-side navigation can reuse an auth page prefetched before sign-in.
    if (refreshOnMount) router.refresh();
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [refreshOnMount, router]);
  return null;
}
