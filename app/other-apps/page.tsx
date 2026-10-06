import type { Metadata } from "next";
import Image from "next/image";
import { TopNav } from "@/components/landing/TopNav";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { HeroBanner } from "@/components/ui/HeroBanner";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { OTHER_APP_SECTIONS, type OtherApp } from "@/lib/otherApps";

export const metadata: Metadata = {
  title: "Our other apps | Coinzy AI",
  description:
    "Trackzio builds AI-powered identification apps for collectors and curious people — coins, banknotes, antiques, rocks, mushrooms, insects, plants and more.",
};

const A = "/assets/other-apps";

const button =
  "flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium leading-5 transition-colors";

/** Figma "Card" (908:42681): 172.5px art, 64px icon + title/description, footer with two buttons. */
function AppCard({ app }: { app: OtherApp }) {
  return (
    <article className="flex h-full flex-col gap-4 overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(10,10,10,0.1)]">
      <div className="relative h-[172.5px] w-full shrink-0">
        <Image
          src={`${A}/${app.slug}-header.webp`}
          alt=""
          fill
          sizes="(min-width: 1280px) 350px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 items-start gap-3 px-4">
        <Image
          src={`${A}/${app.slug}-icon.png`}
          alt={`${app.name} icon`}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-[10px]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="h-[22px] text-base font-medium leading-6 text-[#0a0a0a]">{app.name}</h3>
          <p className="text-sm leading-5 text-[#737373]">{app.description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-[#fafafa] p-4 shadow-[inset_0_1px_0_#e5e5e5]">
        {app.exploreHref ? (
          <a
            href={app.exploreHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button} bg-[#171717] text-[#fafafa] hover:bg-[#2a2a2a]`}
          >
            Explore {app.name}
          </a>
        ) : (
          <span aria-disabled className={`${button} cursor-not-allowed bg-[#171717] text-[#fafafa] opacity-50`}>
            Explore {app.name}
          </span>
        )}
        {app.playHref ? (
          <a
            href={app.playHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button} border border-[#e5e5e5] bg-white text-ink hover:bg-neutral-50`}
          >
            Get the app
          </a>
        ) : (
          <span aria-disabled className={`${button} border border-[#e5e5e5] bg-white text-muted`}>
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}

/** Trackzio app family — Figma `Landing page/Our other apps` (876:23169). */
export default function OtherAppsPage() {
  return (
    <>
      <TopNav />
      <main className="bg-cream">
        {/* Hero (Figma 908:43028) */}
        <HeroBanner
          label="The family"
          title="One team. Ten identification apps."
          description="Trackzio builds AI-powered identification apps for collectors and curious people. Point a camera, upload a photo, know what you're looking at."
        />

        {OTHER_APP_SECTIONS.map((section) => (
          <section key={section.label} className={section.className}>
            <div className="mx-auto w-full max-w-[1440px] px-6 py-20 lg:px-[160px] lg:py-[140px]">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase leading-4 text-primary-500">{section.label}</p>
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl font-medium leading-8 text-ink">{section.title}</h2>
                  <p className="text-sm leading-5 text-muted">{section.description}</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-9 md:grid-cols-2 xl:grid-cols-3">
                {section.apps.map((app) => (
                  <AppCard key={app.slug} app={app} />
                ))}
              </div>
            </div>
          </section>
        ))}

        <WebappCTASection />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
