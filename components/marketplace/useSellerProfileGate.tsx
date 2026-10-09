"use client";

import { useCallback, useRef, useState } from "react";
import type { SellerDetails } from "@/lib/api/auth-session";
import { isSellerProfileComplete } from "@/lib/marketplace/sellerProfile";
import {
  SetSellerProfileDialog,
  type PublicSellerProfile,
} from "@/components/marketplace/SetSellerProfileDialog";

type GateResult = { ok: true; profile: PublicSellerProfile } | { ok: false; cancelled: true };

/**
 * Gate sell/list flows behind Set Seller Profile (Figma `1363:172631`).
 *
 * Usage for sibling flows:
 * ```tsx
 * const gate = useSellerProfileGate({ personalEmail, defaultName });
 * // on List / Add for Sale click:
 * const result = await gate.ensureSellerProfile();
 * if (!result.ok) return; // user cancelled
 * // continue with result.profile.sellerDetails
 * return <>{gate.profileDialog}</>;
 * ```
 */
export function useSellerProfileGate({
  personalEmail,
  defaultName = "",
}: {
  personalEmail: string;
  defaultName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState<PublicSellerProfile | null>(null);
  const resolveRef = useRef<((result: GateResult) => void) | null>(null);

  const close = useCallback((result: GateResult) => {
    setOpen(false);
    setSubmitting(false);
    setError(null);
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(result);
  }, []);

  const loadProfile = useCallback(async (): Promise<PublicSellerProfile | null> => {
    const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    const json = (await res.json()) as { error?: boolean; reason?: string; user?: PublicSellerProfile };
    if (!res.ok || json.error || !json.user) return null;
    setCached(json.user);
    return json.user;
  }, []);

  const ensureSellerProfile = useCallback(async (): Promise<GateResult> => {
    const profile = cached ?? (await loadProfile());
    if (profile && isSellerProfileComplete(profile.sellerDetails)) {
      return { ok: true, profile };
    }
    setError(null);
    setOpen(true);
    return new Promise<GateResult>((resolve) => {
      resolveRef.current = resolve;
    });
  }, [cached, loadProfile]);

  const save = useCallback(
    async (details: SellerDetails) => {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerDetails: details }),
      });
      const json = (await res.json()) as { error?: boolean; reason?: string; user?: PublicSellerProfile };
      setSubmitting(false);
      if (!res.ok || json.error || !json.user) {
        setError(json.reason ?? "Could not save seller profile. Please try again.");
        return;
      }
      setCached(json.user);
      close({ ok: true, profile: json.user });
    },
    [close],
  );

  const profileDialog = (
    <SetSellerProfileDialog
      open={open}
      onClose={() => close({ ok: false, cancelled: true })}
      personalEmail={personalEmail || cached?.email || ""}
      defaultName={defaultName || cached?.name || ""}
      initialDetails={cached?.sellerDetails}
      submitting={submitting}
      error={error}
      onSave={save}
    />
  );

  return {
    ensureSellerProfile,
    refreshSellerProfile: loadProfile,
    sellerProfile: cached,
    profileDialog,
    /** Imperative open (e.g. edit profile) without awaiting completeness. */
    openSellerProfileSetup: () => {
      setOpen(true);
    },
  };
}
