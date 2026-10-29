"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CategoryCard, type Category } from "@/components/landing/BrowseCatalogueSection";
import { MARKETPLACE_PAGE_CATEGORIES } from "@/lib/constants";

const CATEGORIES = [
  { ...MARKETPLACE_PAGE_CATEGORIES[1], slug: "rare-american-coins", title: "Rare American coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[0], slug: "all", title: "World coins", coin: "/assets/landing-page/05-browse-catalogue/coin-indian-gold.png" },
  { ...MARKETPLACE_PAGE_CATEGORIES[2], slug: "commemorative-coins", title: "Commemorative US coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[3], slug: "us-gold-coins", title: "American Gold coins", coin: "/assets/landing-page/05-browse-catalogue/coin-indian-gold.png" },
];

/** Illustrated category band in the signed-in catalogue; category changes reset the result page. */
export function CatalogueCategoryBand({ category, query }: { category?: string; query: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <section className="flex flex-col gap-3" aria-label="Coin categories">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-lg font-medium leading-7 text-ink">Browse coins by category</h2>
        <div className="flex shrink-0 items-center gap-3 text-sm font-medium text-primary-500">
          {category && category !== "all" && <Link href={query ? `/catalogue?q=${encodeURIComponent(query)}` : "/catalogue"}>All coins</Link>}
          <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded((value) => !value)} className="flex items-center gap-2 py-1">
            {expanded ? "See less" : "See more"}
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" className={expanded ? "" : "rotate-180"}><path d="m4 10 4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div id={id} className="grid auto-rows-fr grid-cols-1 gap-6 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-3">
        {CATEGORIES.map(({ slug, ...card }, index) => {
          const params = new URLSearchParams();
          if (slug !== "all") params.set("category", slug);
          if (query) params.set("q", query);
          const href = params.size ? `/catalogue?${params}` : "/catalogue";
          const item: Category = { ...card, href };
          const visibility = expanded || index === 0 ? "" : index === 1 ? "hidden min-[600px]:block" : index === 2 ? "hidden min-[1100px]:block" : "hidden";
          return <div key={slug} className={`${visibility} min-w-0 [&>a]:h-full [&_article]:h-full [&_h3]:min-h-10 ${category === slug ? "rounded-2xl ring-2 ring-primary-500" : ""}`}><CategoryCard category={item} /></div>;
        })}
      </div>
    </section>
  );
}
