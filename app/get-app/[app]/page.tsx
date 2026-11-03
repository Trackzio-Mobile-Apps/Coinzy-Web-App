import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GetAppRedirect } from "@/components/landing/GetAppRedirect";
import { HOME_OTHER_APPS } from "@/lib/home";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function GetOtherAppPage({ params }: { params: Promise<{ app: string }> }) {
  const { app: slug } = await params;
  const app = HOME_OTHER_APPS.find((item) => item.slug === slug);
  if (!app) notFound();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cream px-6 py-12 text-center">
      <Image src={app.icon} alt="" width={64} height={64} className="rounded-xl" />
      <h1 className="text-2xl font-semibold leading-8 text-ink">Get {app.name}</h1>
      <GetAppRedirect appName={app.name} appStoreHref={app.appStoreHref} playHref={app.playHref} />
      <div className="flex flex-wrap justify-center gap-3">
        {app.appStoreHref && <a href={app.appStoreHref} className="rounded-lg bg-white px-5 py-3 text-ink">Download on the App Store</a>}
        <a href={app.playHref} className="rounded-lg bg-white px-5 py-3 text-ink">Get it on Google Play</a>
      </div>
    </main>
  );
}
