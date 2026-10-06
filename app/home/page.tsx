import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { HomeDashboard, moneyFromListingPrice } from "@/components/home/HomeDashboard";
import { getSessionUser } from "@/lib/auth/session";
import { fetchAllListings, fetchArchetypes, fetchCoinsOfTheDay } from "@/lib/api/coinzy";

export const metadata: Metadata = {
  title: "Home | Coinzy AI",
  description: "Your Coinzy dashboard — identify coins, browse the marketplace, and unlock Premium.",
};

/** Post-sign-in free-user home — Figma `1898:205770` (Webapp `1242:101939`). */
export default async function SignedInHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth");

  const [listings, cotdList, archetypes] = await Promise.all([
    fetchAllListings().catch(() => []),
    fetchCoinsOfTheDay().catch(() => []),
    fetchArchetypes({ pageNo: 0, pageSize: 3 }).catch(() => ({ items: [] as Awaited<ReturnType<typeof fetchArchetypes>>["items"] })),
  ]);

  const cotd = cotdList[0];
  const priceEntries = cotd?.estimatedPrice ? Object.values(cotd.estimatedPrice) : [];
  const priceLabel = priceEntries.length
    ? priceEntries
        .map((v) => (typeof v === "number" ? `$${v}` : String(v)))
        .slice(0, 2)
        .join(" - ")
    : "$3,200 - $4,150";

  return (
    <div className="flex h-svh overflow-hidden bg-white">
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
                origin: cotd.issuer || "—",
                year: cotd.yearOfMinting != null ? String(cotd.yearOfMinting) : "—",
                price: priceLabel.startsWith("$") ? priceLabel : `$ ${priceLabel}`,
                images: cotd.imageUrls.slice(0, 2).length
                  ? cotd.imageUrls.slice(0, 2)
                  : ["/assets/home/coin-of-day-a.png", "/assets/home/coin-of-day-b.png"],
              }
            : null
        }
        catalogue={archetypes.items.slice(0, 3).map((a) => ({
          id: a.archetypeId,
          name: a.name,
          price: a.issuer ? a.issuer : "View details",
          image: a.imageUrls[0] || "/assets/home/catalogue-1.png",
        }))}
      />
    </div>
  );
}
