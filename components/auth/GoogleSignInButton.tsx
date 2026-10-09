"use client";

import Image from "next/image";
import { goHome, submitGoogleAuth } from "@/lib/auth/client";

type Variant = "welcome" | "icon";

export function GoogleSignInButton({
  variant,
  next = null,
  pending,
  onPendingChange,
  onError,
  label = "Sign up with Google",
}: {
  variant: Variant;
  next?: string | null;
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
  onError: (message: string) => void;
  /** Welcome row label; ignored for circular icon variant. */
  label?: string;
}) {
  async function run() {
    if (pending) return;
    onPendingChange(true);
    onError("");
    try {
      await submitGoogleAuth();
      goHome(next);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      onPendingChange(false);
    }
  }

  if (variant === "welcome") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-button border border-[#e5e5e5] bg-white px-4 text-sm font-medium leading-5 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <span className="flex size-6 shrink-0 items-center justify-center">
          <Image src="/assets/auth/google.png" alt="" width={24} height={24} />
        </span>
        {pending ? "Please wait…" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Continue with Google"
      disabled={pending}
      onClick={run}
      className="flex size-14 items-center justify-center rounded-full border border-[#e5e5e5] hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      <Image src="/assets/auth/google.png" alt="" width={24} height={24} />
    </button>
  );
}
