import type { Metadata } from "next";
import { GetAppRedirect } from "@/components/landing/GetAppRedirect";
import { LogoMark } from "@/components/landing/TopNav";
import { AppStoreButtons } from "@/components/ui/AppStoreButtons";

export const metadata: Metadata = {
  title: "Get the Coinzy AI app",
  description: "Download Coinzy AI from the App Store or Google Play.",
  robots: { index: false, follow: false },
};

/** QR landing page: the client detects the phone and opens the right store; the buttons are the fallback. */
export default function GetAppPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cream px-6 py-12 text-center">
      <LogoMark />
      <h1 className="text-2xl font-semibold leading-8 text-ink">Get Coinzy AI</h1>
      <GetAppRedirect />
      <AppStoreButtons className="justify-center" />
    </main>
  );
}
