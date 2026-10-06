import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/landing/TopNav";
import { AuthFlow, type AuthMode } from "@/components/auth/AuthFlow";
import { PLAY_STORE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Welcome to Coinzy | Coinzy AI",
  description: "Join Coinzy to start building your coin collection.",
};

/** Web entry screen — Figma 1758:121426. */
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode: requestedMode } = await searchParams;
  const modes: AuthMode[] = ["welcome", "signup", "login", "forgot", "otp", "reset"];
  const mode = modes.includes(requestedMode as AuthMode) ? requestedMode as AuthMode : "welcome";
  const backHref = mode === "welcome" ? "/" : mode === "forgot" ? "/auth?mode=login" : mode === "otp" ? "/auth?mode=forgot" : mode === "reset" ? "/auth?mode=otp" : "/auth";

  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-16 items-center justify-between border-b border-border-light px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 border-r border-border-light pr-4 sm:w-[222px] sm:pr-6">
          <LogoMark />
          <div>
            <p className="text-lg font-medium leading-7 text-ink">Coinzy AI</p>
            <p className="text-xs leading-4 text-muted">AI Coin Identifier</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth?mode=login" className="rounded-button px-4 py-2 text-sm font-medium leading-5">Log in</Link>
          <Link href={PLAY_STORE_URL} className="rounded-button bg-primary-500 px-3 py-1.5 text-sm font-medium leading-5 text-white hover:bg-primary-700">Get the App</Link>
        </div>
      </header>
      <main className="grid min-h-[calc(100svh-64px)] bg-gradient-to-b from-[#f9fafb] to-[#edf0f3] lg:grid-cols-[727fr_713fr]">
        <section aria-label="Collect smarter, trade easier" className="relative hidden min-h-[746px] overflow-hidden lg:flex lg:items-end">
          <Image src="/assets/auth/coins-background.jpg" alt="" fill priority sizes="51vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(186.316deg,rgba(102,102,102,0)_19.432%,rgba(0,0,0,0.8)_67.566%)]" />
          <div className="relative w-full bg-[linear-gradient(180deg,rgba(114,113,113,0)_26.089%,rgba(30,30,31,0.6)_100%)] px-[52px] py-[70px]">
            <div className="max-w-[487px] space-y-4">
              <h2 className="text-[60px] font-bold leading-[1.3] text-white">Collect smarter,<br />trade <span className="font-light">easier</span></h2>
              <p className="text-xl font-light leading-7 text-[#f2f2f3]">Join 200,000+ collectors building their numismatic legacy — one coin at a time.</p>
            </div>
          </div>
        </section>
        <section aria-label="Account access" className={`relative flex min-h-[746px] flex-col items-center justify-center gap-6 px-4 py-20 sm:px-8 ${mode === "welcome" ? "lg:pb-0 lg:pt-16" : "lg:py-0"} ${mode === "signup" ? "bg-[#f7f7f7]" : ""}`}>
          <Link href={backHref} className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium leading-4 text-muted">
            <Image src="/assets/auth/back.svg" alt="" width={16} height={16} />Back
          </Link>
          <AuthFlow mode={mode} />
          {(mode === "welcome" || mode === "signup") && <p className="text-center text-xs font-light leading-4 text-muted">
            By continuing you agree to our <span className="font-medium underline">Terms of Service</span> and<br />
            <span className="font-medium underline">Privacy Policy</span>
          </p>}
        </section>
      </main>
    </div>
  );
}
