import Image from "next/image";

interface PageHeroProps {
  label: string;
  title: string;
  description: string;
}

/** Dark bronze 344px banner used at the top of inner pages (Marketplace, Catalogue). */
export function PageHero({ label, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#f5eaea]">
      <Image
        src="/assets/marketplace/hero-background.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="relative mx-auto flex min-h-[344px] max-w-[1440px] items-center justify-center px-6 py-16 lg:px-[160px]">
        <div className="w-full max-w-[556px] space-y-3">
          <p className="text-xs uppercase leading-4 text-primary-50">{label}</p>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.3] text-primary-50 sm:text-5xl sm:leading-[1.3]">{title}</h1>
            <p className="text-base leading-6 text-neutral-50">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
