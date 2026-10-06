"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { submitAuth } from "@/lib/auth/client";

const PROVIDERS = [
  { name: "Google", asset: "google.png", width: 24, height: 24 },
  { name: "Email", asset: "email.svg", width: 21.4996, height: 18.5004 },
];

export function WelcomeActions() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  async function guest() {
    if (pending) return;
    setPending(true); setNotice("");
    try { await submitAuth("guest"); router.push("/home"); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to start a guest session."); }
    finally { setPending(false); }
  }
  return (
    <div className="w-full max-w-[352px] rounded-xl bg-white px-6 py-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-[30px] font-medium leading-9 text-[#0a0a0a]">Welcome to Coinzy</h1>
          <p className="text-sm leading-5 text-[#737373]">New here? Set up your account to start building your collection with us.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-3">
              {PROVIDERS.map((provider) => (
                <button key={provider.name} type="button" disabled={provider.name === "Google" || pending} title={provider.name === "Google" ? "Google sign-in is not available yet." : undefined} onClick={() => router.push("/auth?mode=signup")} className="flex h-10 w-full items-center justify-center gap-2 rounded-button border border-[#e5e5e5] bg-white px-4 text-sm font-medium leading-5 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                  <span className="flex size-6 shrink-0 items-center justify-center">
                    <Image src={`/assets/auth/${provider.asset}`} alt="" width={provider.width} height={provider.height} />
                  </span>
                  Sign up with {provider.name}
                </button>
              ))}
            </div>
            <div className="flex h-7 items-center gap-2 px-4 pt-2 text-sm leading-5 text-muted">
              <span className="relative h-px flex-1 overflow-hidden"><Image src="/assets/auth/separator.svg" alt="" width={300} height={1} className="absolute left-0 top-0 max-w-none" /></span>
              or
              <span className="relative h-px flex-1 overflow-hidden"><Image src="/assets/auth/separator.svg" alt="" width={300} height={1} className="absolute left-0 top-0 max-w-none" /></span>
            </div>
            <button type="button" disabled={pending} onClick={guest} className="flex h-9 w-full items-center justify-center rounded-button px-2.5 text-sm font-medium leading-5 text-[#0a0a0a] hover:bg-neutral-50">{pending ? "Please wait…" : "Continue as guest"}</button>
          </div>
          <div className="flex h-6 items-center justify-center gap-1 text-xs leading-4">
            <p className="text-[#6a7282]">Already have an account?</p>
            <Link href="/auth?mode=login" className="rounded-lg px-2 py-1 font-medium text-primary-500 hover:text-primary-700">Log in</Link>
          </div>
        </div>
      </div>
      {notice && <p role="status" className="mt-4 text-center text-xs leading-4 text-muted">{notice}</p>}
    </div>
  );
}
