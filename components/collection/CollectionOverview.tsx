"use client";

import { useState, type ReactNode } from "react";
import { CollectionCreateCollectionCard } from "@/components/collection/CollectionCreateCollectionCard";
import { CollectionHomeCard, type CollectionHomeCardProps } from "@/components/collection/CollectionHomeCard";

export function CollectionOverview({ cards, privateCount, children }: {
  cards: (CollectionHomeCardProps & { name: string })[];
  privateCount: number;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const matching = cards.filter((card) => card.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold leading-8 text-ink sm:flex-1">Collection</h1>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search collections..."
          aria-label="Search collections"
          className="h-8 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 text-xs text-ink sm:min-w-0 sm:flex-1"
        />
        <CollectionCreateCollectionCard privateCount={privateCount} variant="button" />
      </div>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          {matching.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {matching.map((card) => <CollectionHomeCard key={card.href} {...card} />)}
            </div>
          ) : <p role="status" className="mt-4 text-sm text-muted">No collections found.</p>}
        </div>
        {children}
      </div>
    </>
  );
}
