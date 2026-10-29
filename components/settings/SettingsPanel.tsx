"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EditProfileDialog } from "@/components/settings/EditProfileDialog";
import { FaqDialog } from "@/components/settings/FaqDialog";
import { FeedbackDialog } from "@/components/settings/FeedbackDialog";
import { SettingsConfirmDialog } from "@/components/settings/SettingsConfirmDialog";
import {
  SetSellerProfileDialog,
  type PublicSellerProfile,
} from "@/components/marketplace/SetSellerProfileDialog";
import { PremiumSubscribeDialog } from "@/components/premium/PremiumSubscribeDialog";
import type { SellerDetails } from "@/lib/api/auth-session";
import { authHref } from "@/lib/auth/returnTo";
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
  premium = false,
}: {
  initialProfile: Profile | null;
  isGuest: boolean;
  premium?: boolean;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isPremium, setIsPremium] = useState(premium);
  const [notifications, setNotifications] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setIsPremium(premium);
  }, [premium]);

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
      router.refresh();
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
      router.refresh();
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
      // Mirror Android `AppUserDataResetter`: drop local auth state so they cannot stay signed in.
      const { signOutFirebase } = await import("@/lib/firebase/authBridge");
      await signOutFirebase().catch(() => undefined);
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
      window.location.replace("/auth");
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
        <section className="flex min-h-[221px] flex-col overflow-hidden rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
          <SectionLabel>Account</SectionLabel>
          {isGuest ? (
            <Link
              href={authHref("login", "/settings")}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-primary-500 hover:bg-black/[0.02]"
            >
              Login to view account settings
              <Chevron />
            </Link>
          ) : (
            <>
              <Row
                label="Profile"
                action={<span className={linkBtn}>Edit</span>}
                onClick={() => { setFormError(null); setEditOpen(true); }}
              />
              <Row
                label="Seller profile"
                action={<span className={linkBtn}>{sellerComplete ? "Edit" : "Add"}</span>}
                onClick={() => {
                  setFormError(null);
                  void refresh();
                  setSellerOpen(true);
                }}
              />
              <Row
                label="Plan & billing"
                badge={<span className="rounded-full bg-[#e8e8e8] px-2 py-0.5 text-xs font-medium leading-4">{isPremium ? "Premium" : "Free plan"}</span>}
                action={<Chevron />}
                onClick={() => {
                  if (isPremium) {
                    setToast(
                      "Premium is active on this account. Manage billing in Google Play or the App Store.",
                    );
                  } else {
                    setPlansOpen(true);
                  }
                }}
              />
            </>
          )}
        </section>

        <section className="flex min-h-[157px] flex-col overflow-hidden rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
          <SectionLabel>Support</SectionLabel>
          <Row label="FAQ" action={<Chevron />} onClick={() => setFaqOpen(true)} />
          <Row label="Feedback" action={<Chevron />} onClick={() => setFeedbackOpen(true)} />
        </section>

        <section className="flex min-h-[165px] flex-col overflow-hidden rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
          <SectionLabel>Preferences</SectionLabel>
          <Row
            label="Notifications"
            action={<Toggle on={notifications} onChange={toggleNotifications} label="Notifications" />}
          />
          <Row label="Dark Mode" action={<Toggle on={false} label="Dark Mode" disabled />} />
        </section>

        <section className="flex min-h-[277px] flex-col overflow-hidden rounded-xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
          <SectionLabel>General</SectionLabel>
          <a
            href={COINZY_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClassName}
          >
            Terms of Use
            <Chevron />
          </a>
          <a
            href={COINZY_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClassName}
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
              className={rowClassName}
            >
              <span aria-hidden="true">Logout</span>
              <span aria-hidden="true" className="font-medium text-ink">
                Logout
              </span>
            </button>
          )}
          {!isGuest && (
            <Row
              label="Delete account"
              action={<span className="text-sm font-medium text-[#dc2626]">Delete</span>}
              onClick={() => {
                setConfirmError(null);
                setDeleteOpen(true);
              }}
            />
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
      <PremiumSubscribeDialog
        open={plansOpen}
        onClose={() => {
          setPlansOpen(false);
          router.refresh();
        }}
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
        body="Are you sure you want to delete of your account?"
        variant="delete"
        confirmLabel="Delete account"
        confirming={busy && deleteOpen}
        error={confirmError}
        danger
        onConfirm={deleteAccount}
      />
    </>
  );
}

const linkBtn = "px-2.5 py-1 text-sm font-medium text-ink hover:underline";
const rowClassName = "flex min-h-11 w-full flex-1 items-center justify-between gap-3 border-b-[0.5px] border-border-neutral py-2 text-left text-sm leading-5 text-ink last:border-0 hover:bg-black/[0.02]";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-base font-semibold leading-6 text-ink">{children}</p>
    </div>
  );
}

function Row({
  label,
  action,
  badge,
  onClick,
}: {
  label: string;
  badge?: ReactNode;
  action: ReactNode;
  onClick?: () => void;
}) {
  const className = rowClassName;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span className="flex items-center gap-3">{label}{badge}</span>
        {action}
      </button>
    );
  }
  return (
    <div className={className}>
      <span className="flex items-center gap-3">{label}{badge}</span>
      {action}
    </div>
  );
}

function Chevron() {
  return (
    <Image src="/assets/catalogue/icon-chevron-right.svg" alt="" width={16} height={16} className="shrink-0" />
  );
}

function Toggle({ on, onChange, label, disabled = false }: { on: boolean; onChange?: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      title={disabled ? "Dark mode is not available on web yet" : undefined}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-ink" : "bg-[#d1d1d6]"}`}
    >
      <span
        className={`absolute left-0 top-[3px] size-[22px] rounded-full bg-white shadow transition-transform ${
          on || disabled ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
