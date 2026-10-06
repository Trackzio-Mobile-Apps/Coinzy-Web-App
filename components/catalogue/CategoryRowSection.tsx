import Image from "next/image";
import Link from "next/link";
import {
  CategoryCard,
  type Category,
  type CategoryCardVariant,
} from "@/components/landing/BrowseCatalogueSection";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionShell } from "@/components/ui/SectionShell";

interface CategoryRowSectionProps {
  title: string;
  categories: readonly Category[];
  variant: CategoryCardVariant;
  /** Tailwind grid template for the 4 cards at xl (Figma card widths differ per row). */
  gridClassName: string;
  parchment?: boolean;
  viewAllHref?: string;
}

/** Title + "View all" row over 4 category cards (Catalogue page, Figma 902:48795 / 1531:285774). */
export function CategoryRowSection({
  title,
  categories,
  variant,
  gridClassName,
  parchment = false,
  viewAllHref = "#",
}: CategoryRowSectionProps) {
  return (
    <SectionShell
      className={parchment ? "" : "bg-cream"}
      background={parchment ? <ParchmentBackground variant="section" /> : null}
    >
      <div className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-medium leading-8 text-ink">{title}</h2>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
          >
            View all
            <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
          </Link>
        </div>
        <div className={`grid gap-4 sm:grid-cols-2 ${gridClassName}`}>
          {categories.map((category) => (
            <CategoryCard key={category.title} category={category} variant={variant} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
