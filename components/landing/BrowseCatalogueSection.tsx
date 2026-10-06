import Image from "next/image";
import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { INDIA_CATEGORIES } from "@/lib/constants";

export type Category = {
  title: string;
  subtitle: string;
  illustration: string;
  /** Static coin photo; categories without one show a placeholder until the API is wired. */
  coin?: string;
  coinClassName?: string;
  /** Per-card panel colour; defaults to #f1e4d4. */
  wellBg?: string;
  /** View-all page for this category (e.g. /catalogue/mughal-coins). */
  href?: string;
};

/** "india" = Geist medium title (home); "marketplace" = Plus Jakarta bold title (Figma 902:25454). */
export type CategoryCardVariant = "india" | "marketplace";

export function CategoryCard({
  category,
  variant = "india",
}: {
  category: Category;
  variant?: CategoryCardVariant;
}) {
  const card = (
    <article
      className={`overflow-hidden rounded-2xl border-[0.5px] border-[#c2c2c4] bg-surface p-[4.5px] ${
        category.href ? "transition-shadow hover:shadow-md" : ""
      }`}
    >
      <div
        className="relative h-[104px] rounded-[var(--radius-inner)]"
        style={{ backgroundColor: category.wellBg ?? "#f1e4d4" }}
      >
        {/* Rendered at the Figma well's left 141×104 region; illustration sits at (8, 46). */}
        <Image
          src={category.illustration}
          alt=""
          width={141}
          height={104}
          className="absolute left-0 top-0 h-[104px] w-[141px]"
        />
        {category.coin ? (
          <Image
            src={category.coin}
            alt=""
            width={88}
            height={88}
            className={`absolute right-[23px] top-[28px] size-[88px] rounded-full object-contain ${category.coinClassName ?? ""}`}
          />
        ) : (
          <CoinPlaceholder
            size="category"
            className="absolute right-[23px] top-[28px]"
          />
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3
          className={
            variant === "marketplace"
              ? "font-jakarta text-sm font-bold leading-none text-ink"
              : "text-sm font-medium leading-5 text-ink"
          }
        >
          {category.title}
        </h3>
        <p
          className={`font-jakarta text-xs leading-[1.5] ${
            variant === "marketplace" ? "text-muted" : "text-[#7a6c65]"
          }`}
        >
          {category.subtitle}
        </p>
      </div>
    </article>
  );
  return category.href ? (
    <Link href={category.href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

interface BrowseCatalogueSectionProps {
  label?: string;
  description?: string;
  className?: string;
  categories?: readonly Category[];
  innerClassName?: string;
  cardVariant?: CategoryCardVariant;
  labelClassName?: string;
  viewAllHref?: string;
}

export function BrowseCatalogueSection({
  label = "Browse Catalogue",
  description = "Explore popular collecting categories, from ancient Roman to rare American.",
  className = "bg-cream",
  categories = INDIA_CATEGORIES,
  // Figma home frame: 307px of content centred in a 536px section.
  innerClassName = "lg:!py-[114.5px]",
  cardVariant = "india",
  labelClassName,
  viewAllHref = "/catalogue",
}: BrowseCatalogueSectionProps) {
  return (
    <SectionShell id="catalogue" className={className} innerClassName={innerClassName}>
      <div className="space-y-8">
        <SectionHeader
          label={label}
          title="Browse coins by category"
          description={description}
          actionLabel="View all"
          actionHref={viewAllHref}
          {...(labelClassName ? { labelClassName } : {})}
        />

        <div
          className={`grid gap-6 sm:grid-cols-2 ${
            cardVariant === "marketplace" ? "xl:grid-cols-[repeat(4,260px)]" : "xl:grid-cols-4"
          }`}
        >
          {categories.map((category) => (
            <CategoryCard key={category.title} category={category} variant={cardVariant} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
