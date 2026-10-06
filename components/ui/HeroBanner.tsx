import Image from "next/image";

/**
 * Brown radial-gradient page hero (Figma "CTA" on Our other apps 908:43028 / Blogs 885:27702):
 * 344px tall, 556px copy block — small label, 48px bold heading, 16px intro.
 */
export function HeroBanner({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <section className="relative flex min-h-[344px] flex-col items-center justify-center overflow-hidden bg-[#f5eaea] px-6 py-16 lg:px-[160px]">
      <Image src="/assets/shared/hero-brown-bg.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative flex w-full max-w-[556px] flex-col gap-3">
        <p className="text-xs uppercase leading-4 text-primary-50">{label}</p>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold leading-[normal] text-primary-50 sm:text-5xl sm:leading-[normal]">{title}</h1>
          <p className="text-base leading-6 text-neutral-50">{description}</p>
        </div>
      </div>
    </section>
  );
}
