"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";
import { AUTHED_HINT_COOKIE } from "@/lib/auth/authed-hint";
import type { SidebarActive } from "@/lib/sidebarNav";

/**
 * Sync loading chrome for dual-auth routes (`/marketplace`, `/catalogue`).
 *
 * Must stay free of `cookies()` / other async server reads so Next can prefetch and
 * paint immediately on soft-nav. Auth branch uses the readable `coinzy_authed` hint
 * (not the HTTP-only JWT) — server snapshot defaults to logged-out so anonymous
 * visitors never flash the signed-in sidebar.
 */
function readAuthedHint(): boolean {
  return document.cookie.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === AUTHED_HINT_COOKIE && value === "1";
  });
}

function subscribeAuthedHint() {
  // Cookie writes don't emit events; loading UI is short-lived so a static subscribe is enough.
  return () => {};
}

export function DualAuthRouteLoading({
  active,
  title,
  signedIn,
  loggedOut,
}: {
  active: SidebarActive;
  title: string;
  signedIn: ReactNode;
  loggedOut: ReactNode;
}) {
  const authed = useSyncExternalStore(subscribeAuthedHint, readAuthedHint, () => false);

  if (authed) {
    return (
      <SignedInRouteLoading active={active} title={title}>
        {signedIn}
      </SignedInRouteLoading>
    );
  }

  return (
    <>
      <TopNav />
      <main className="bg-cream" aria-busy="true" aria-label={`Loading ${title}`}>
        <section className="mx-auto w-full max-w-[1440px] animate-pulse px-6 pb-8 pt-20 lg:px-[160px]">
          <div className="mb-2 h-4 w-28 rounded bg-black/[0.06]" />
          <div className="mb-3 h-10 w-full max-w-xl rounded bg-black/[0.07]" />
          <div className="mb-10 h-4 w-full max-w-2xl rounded bg-black/[0.05]" />
          {loggedOut}
        </section>
      </main>
    </>
  );
}
