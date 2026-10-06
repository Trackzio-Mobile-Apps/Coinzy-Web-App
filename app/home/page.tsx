import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReloadOnRestore } from "@/components/auth/ReloadOnRestore";
import { AppSidebar } from "@/components/home/AppSidebar";
import { HomeDashboard, moneyFromListingPrice } from "@/components/home/HomeDashboard";
import { getSessionUser } from "@/lib/auth/session";
import {
  fetchAllListings,
  fetchArchetypes,
  fetchCoinsOfTheDay,
  todayKey,
  type Archetype,
} from "@/lib/api/coinzy";
import { estimatedSpan } from "@/lib/catalogue/coinDetails";

export const metadata: Metadata = {
  title: "Home | Coinzy AI",
  description: "Your Coinzy dashboard — identify coins, browse the marketplace, and unlock Premium.",
};

/** Card subtitle for a catalogue list item: real price span, else "issuer · year", else a neutral CTA. Never a made-up price. */
function catalogueSubtitle(a: Archetype): string {
  const span = estimatedSpan(a.estimatedPrice ?? null);
  if (span) return span;
  const year = a.yearOfMinting != null ? String(a.yearOfMinting).trim() : "";
  return [a.issuer?.trim(), year].filter(Boolean).join(" · ") || "View details";
}

/** Post-sign-in free-user home — Figma `1898:205770` (Webapp `1242:101939`). */
export default async function SignedInHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth");

  const [listings, cotdList, archetypes] = await Promise.all([
    fetchAllListings().catch(() => []),
    fetchCoinsOfTheDay(todayKey()).catch(() => []),
    // Live catalogue, 3 items. On failure → [] and the dashboard shows its static fallback rows.
    fetchArchetypes({ pageNo: 0, pageSize: 3 })
      .then((page) => page.items)
      .catch((): Archetype[] => []),
  ]);

  // Free users see the first coin of the day; the rest are the Premium unlock.
  const [cotd, ...lockedCotd] = cotdList;

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <ReloadOnRestore />
      <AppSidebar user={user} />
      <HomeDashboard
        user={user}
        listings={listings.slice(0, 4).map((l) => ({
          id: l.id,
          name: l.title,
          year: "—",
          issuer: "Marketplace",
          rarity: "Listed",
          rarityTone: "muted" as const,
          price: moneyFromListingPrice(l.price),
          image: l.imageUrls[0] || "/assets/home/coin-listing-1.png",
        }))}
        coinOfTheDay={
          cotd
            ? {
                id: cotd._id,
                name: cotd.name,
                origin: cotd.issuer || "NA",
                year: cotd.yearOfMinting != null && String(cotd.yearOfMinting).trim() ? String(cotd.yearOfMinting) : "NA",
                price: estimatedSpan(cotd.estimatedPrice) ?? "NA",
                images: (cotd.imageUrls ?? []).filter(Boolean).slice(0, 2),
                lockedCount: lockedCotd.length,
              }
            : null
        }
        catalogue={archetypes.slice(0, 3).map((a) => ({
          id: a.archetypeId,
          name: a.name,
          price: catalogueSubtitle(a),
          image: a.imageUrls?.[0] || null,
        }))}
      />
    </div>
  );
}
