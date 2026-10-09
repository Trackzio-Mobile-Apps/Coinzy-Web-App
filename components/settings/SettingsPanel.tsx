"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EditProfileDialog } from "@/components/settings/EditProfileDialog";
import { FaqDialog } from "@/components/settings/FaqDialog";
import { FeedbackDialog } from "@/components/settings/FeedbackDialog";
import { SettingsConfirmDialog } from "@/components/settings/SettingsConfirmDialog";
import {
  SetSellerProfileDialog,
  type PublicSellerProfile,
} from "@/components/marketplace/SetSellerProfileDialog";
import type { SellerDetails } from "@/lib/api/auth-session";
import { COINZY_PRIVACY_URL, COINZY_TERMS_URL } from "@/lib/constants";
import { isSellerProfileComplete } from "@/lib/marketplace/sellerProfile";

const NOTIFY_KEY = "coinzy_notifications_enabled";

type Profile = PublicSellerProfile;

/**
 * Settings hub — Figma `1368:256937` (+ modals).
 * Behavior from Android handoff: logout/delete APIs, FAQ, feedback, guest account gate.
 */
export function SettingsPanel({
  initialProfile,
  isGuest,
}: {
  initialProfile: Profile | null;
  isGuest: boolean;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [notifications, setNotifications] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFY_KEY);
      if (raw === null) setNotifications(true);
      else setNotifications(raw === "1" || raw === "true");
    } catch {
      setNotifications(true);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    const json = (await res.json()) as { error?: boolean; user?: Profile };
    if (res.ok && !json.error && json.user) setProfile(json.user);
  }, []);

  const toggleNotifications = () => {
    setNotifications((on) => {
      const next = !on;
      try {
        localStorage.setItem(NOTIFY_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const saveProfile = async (payload: { fullName: string; syncSellerEmail: boolean }) => {
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: boolean; reason?: string; user?: Profile };
      if (!res.ok || json.error || !json.user) {
        setFormError(json.reason ?? "Could not save profile.");
        setBusy(false);
        return;
      }
      setProfile(json.user);
      setEditOpen(false);
      setToast("User profile updated successfully!");
      setBusy(false);
    } catch {
      setFormError("Could not save profile.");
      setBusy(false);
    }
  };

  const saveSeller = async (sellerDetails: SellerDetails) => {
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerDetails }),
      });
      const json = (await res.json()) as { error?: boolean; reason?: string; user?: Profile };
      if (!res.ok || json.error || !json.user) {
        setFormError(json.reason ?? "Could not save seller profile.");
        setBusy(false);
        return;
      }
      setProfile(json.user);
      setSellerOpen(false);
      setToast(sellerComplete ? "Seller profile updated successfully!" : "Seller profile created successfully!");
      setBusy(false);
    } catch {
      setFormError("Could not save seller profile.");
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setConfirmError(null);
    try {
      const { signOutFirebase } = await import("@/lib/firebase/authBridge");
      await signOutFirebase().catch(() => undefined);
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* still hard-navigate */
    }
    window.location.replace("/");
  };

  const deleteAccount = async () => {
    setBusy(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE", credentials: "same-origin" });
      const json = (await res.json()) as { error?: boolean; reason?: string };
      if (!res.ok || json.error) {
        setConfirmError(json.reason ?? "Could not delete account.");
        setBusy(false);
        return;
      }
      window.location.replace("/");
    } catch {
      setConfirmError("Could not delete account.");
      setBusy(false);
    }
  };

  const sellerComplete = isSellerProfileComplete(profile?.sellerDetails);
  const displayName = profile?.name || "";
  const email = profile?.email || "";

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h2 className="text-xl font-medium leading-7 text-ink">Settings</h2>

        <section className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <SectionLabel>Account</SectionLabel>
          {isGuest ? (
            <Link
              href="/auth?next=/settings"
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-primary-500 hover:bg-black/[0.02]"
            >
              Login to view account settings
              <Chevron />
            </Link>
          ) : (
            <>
              <Row
                label="Profile"
                action={
                  <button type="button" onClick={() => { setFormError(null); setEditOpen(true); }} className={linkBtn}>
                    Edit
                  </button>
                }
              />
              <Row
                label="Seller profile"
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      void refresh();
                      setSellerOpen(true);
                    }}
                    className={linkBtn}
                  >
                    {sellerComplete ? "Edit" : "Add"}
                  </button>
                }
              />
              <Row
                label="Plan & billing"
                action={
                  <span className="inline-flex items-center gap-2">
                    <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#606062]">Free plan</span>
                    <Chevron />
                  </span>
                }
                onClick={() => setToast("Plan & billing — coming soon")}
              />
              <Row
                label="Delete account"
                action={<span className="text-sm font-medium text-[#dc2626]">Delete</span>}
                onClick={() => {
                  setConfirmError(null);
                  setDeleteOpen(true);
                }}
              />
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <SectionLabel>Support</SectionLabel>
          <Row label="FAQ" action={<Chevron />} onClick={() => setFaqOpen(true)} />
          <Row label="Feedback" action={<Chevron />} onClick={() => setFeedbackOpen(true)} />
        </section>

        <section className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <SectionLabel>Preferences</SectionLabel>
          <Row
            label="Notifications"
            action={<Toggle on={notifications} onChange={toggleNotifications} label="Notifications" />}
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <SectionLabel>General</SectionLabel>
          <a
            href={COINZY_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-sm text-ink hover:bg-black/[0.02]"
          >
            Terms of Use
            <Chevron />
          </a>
          <a
            href={COINZY_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-sm text-ink hover:bg-black/[0.02]"
          >
            Privacy Policy
            <Chevron />
          </a>
          {!isGuest && (
            <button
              type="button"
              aria-label="Log out"
              onClick={() => {
                setConfirmError(null);
                setLogoutOpen(true);
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-ink hover:bg-black/[0.02]"
            >
              <span aria-hidden="true">Logout</span>
              <span aria-hidden="true" className="font-medium text-[#b45353]">
                Logout
              </span>
            </button>
          )}
        </section>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-xl border-l-[5px] border-[#008557] bg-white p-4 shadow-lg"
        >
          <p className="text-sm font-medium text-ink">{toast}</p>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="ml-auto size-4 shrink-0">
            <Image src="/assets/home/icon-close-dark.svg" alt="" width={16} height={16} />
          </button>
        </div>
      )}

      <EditProfileDialog
        open={editOpen}
        onClose={() => !busy && setEditOpen(false)}
        name={displayName}
        email={email}
        submitting={busy && editOpen}
        error={formError}
        onSave={saveProfile}
      />

      <SetSellerProfileDialog
        open={sellerOpen}
        onClose={() => !busy && setSellerOpen(false)}
        personalEmail={email}
        defaultName={displayName}
        initialDetails={profile?.sellerDetails}
        submitting={busy && sellerOpen}
        error={formError}
        onSave={saveSeller}
      />

      <FaqDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        defaultName={displayName}
        defaultEmail={email}
      />

      <SettingsConfirmDialog
        open={logoutOpen}
        onClose={() => !busy && setLogoutOpen(false)}
        title="Log out of your account?"
        body="Are you sure you want to log out of your account?"
        confirmLabel="Logout"
        confirming={busy && logoutOpen}
        error={confirmError}
        danger
        onConfirm={logout}
      />

      <SettingsConfirmDialog
        open={deleteOpen}
        onClose={() => !busy && setDeleteOpen(false)}
        title="Delete your account?"
        body="This action cannot be undone."
        confirmLabel="Delete account"
        confirming={busy && deleteOpen}
        error={confirmError}
        danger
        onConfirm={deleteAccount}
      />
    </>
  );
}

const linkBtn = "text-sm font-medium text-primary-500 hover:underline";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-[#f0f0f0] px-4 py-2.5">
      <p className="text-sm font-semibold leading-6 text-ink">{children}</p>
    </div>
  );
}

function Row({
  label,
  action,
  onClick,
}: {
  label: string;
  action: ReactNode;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center justify-between gap-3 border-b border-[#f0f0f0] px-4 py-3 text-left text-sm text-ink last:border-0 hover:bg-black/[0.02]";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span>{label}</span>
        {action}
      </button>
    );
  }
  return (
    <div className={className}>
      <span>{label}</span>
      {action}
    </div>
  );
}

function Chevron() {
  return (
    <Image src="/assets/catalogue/icon-chevron-right.svg" alt="" width={16} height={16} className="opacity-40" />
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-ink" : "bg-[#d4d4d4]"}`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
