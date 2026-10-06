import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReloadOnRestore } from "@/components/auth/ReloadOnRestore";
import { AppSidebar } from "@/components/home/AppSidebar";
import { HomeDashboard, type MarketChip } from "@/components/home/HomeDashboard";
import type { CotdCoin } from "@/components/home/PremiumCoinOfTheDay";
import { getPremiumStatus, getSessionUser } from "@/lib/auth/session";
import {
  fetchArchetypeDetails,
  fetchArchetypes,
  fetchCoinsOfTheDay,
  todayKey,
  type Archetype,
  type ArchetypeDetails,
} from "@/lib/api/coinzy";
import { coinDrawerSections, estimatedSpan } from "@/lib/catalogue/coinDetails";
import { FROM_HOME, withFrom } from "@/lib/backNav";
import { MARKETPLACE_CHIPS } from "@/lib/home";
import { getMarketplaceCategory, loadListingPage } from "@/lib/marketplace/categories";

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

/** One of today's coins as the serializable view-model shared by the free card, the premium carousel and the drawer. */
function toCotdCoin(c: ArchetypeDetails): CotdCoin {
  const images = (c.imageUrls ?? []).filter(Boolean).slice(0, 2);
  return {
    id: c._id,
    name: c.name,
    origin: c.issuer || "NA",
    year: c.yearOfMinting != null && String(c.yearOfMinting).trim() ? String(c.yearOfMinting) : "NA",
    price: estimatedSpan(c.estimatedPrice ?? null) ?? "NA",
    images,
    drawer: { title: c.name, images, sections: coinDrawerSections(c) },
    href: c._id ? withFrom(`/catalogue/coin/${c._id}`, FROM_HOME) : "/catalogue",
  };
}

const RARITY_LABEL: Record<string, { label: string; tone: "muted" | "warn" | "info" }> = {
  COMMON: { label: "Common", tone: "muted" },
  RARE: { label: "Rare", tone: "info" },
  ULTRA_RARE: { label: "Ultra rare", tone: "warn" },
};

const rarityBadge = (raw: string) =>
  RARITY_LABEL[raw.toUpperCase()] ?? { label: raw.replace(/_/g, " ").toLowerCase(), tone: "muted" as const };

/** The four rows of the marketplace panel for one chip, with year / issuer / rarity from each listing's catalogue entry. */
async function loadMarketRows(slug: string) {
  try {
    const { cards } = await loadListingPage(getMarketplaceCategory(slug) ?? getMarketplaceCategory("all")!, 1, 4);
    const rows = await Promise.all(
      cards.map(async (card) => {
        const coin = card.archetypeId ? await fetchArchetypeDetails(card.archetypeId).catch(() => null) : null;
        const year = coin?.yearOfMinting != null ? String(coin.yearOfMinting).trim() : "";
        const rarity = coin?.rarity ? rarityBadge(coin.rarity) : undefined;
        return {
          id: card.id,
          name: card.title,
          year: year || undefined,
          issuer: coin?.issuer?.trim() || undefined,
          rarity: rarity?.label,
          rarityTone: rarity?.tone,
          price: card.price ?? "Price on request",
          image: card.images[0] || "/assets/home/coin-listing-1.png",
        };
      }),
    );
    return { rows, unavailable: false };
  } catch (err) {
    console.error(err);
    return { rows: [], unavailable: true };
  }
}

/**
 * Post-sign-in home. Free: Figma `1898:205770` (Webapp `1242:101939`). Premium: `1584:205526` with the Coin of the day
 * carousel/drawer `1248:98330` and the daily-limit alert `1912:211426`.
 */
export default async function SignedInHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth");

  // Entitlement lives in `getPremiumStatus` (false until the backend exposes a plan claim). `?premium=1` is a
  // development-only preview switch so the premium screens can be reviewed; it is ignored in production builds.
  const params = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && params.premium === "1");

  const requestedChip = Array.isArray(params.market) ? params.market[0] : params.market;
  const marketSlug = MARKETPLACE_CHIPS.some((c) => c.slug === requestedChip) ? (requestedChip as string) : "all";
  // Chips are links to `/home?market=<slug>`; the dev-only `?premium=1` preview survives the round trip.
  const marketChips: MarketChip[] = MARKETPLACE_CHIPS.map((c) => {
    const qs = new URLSearchParams();
    if (c.slug !== "all") qs.set("market", c.slug);
    if (premium && params.premium === "1") qs.set("premium", "1");
    return { label: c.label, slug: c.slug, href: qs.size ? `/home?${qs}` : "/home", active: c.slug === marketSlug };
  });

  const [market, cotdList, archetypes] = await Promise.all([
    loadMarketRows(marketSlug),
    fetchCoinsOfTheDay(todayKey()).catch(() => []),
    // Live catalogue, 3 items. On failure → [] and the dashboard shows its static fallback rows.
    fetchArchetypes({ pageNo: 0, pageSize: 3 })
      .then((page) => page.items)
      .catch((): Archetype[] => []),
  ]);

  // Free users see the first coin of the day; the rest are the Premium unlock. Premium users get every coin.
  const [cotd, ...lockedCotd] = cotdList;
  const dayKey = todayKey();

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <ReloadOnRestore />
      <AppSidebar user={user} />
      <HomeDashboard
        user={user}
        listings={market.rows}
        marketChips={marketChips}
        marketUnavailable={market.unavailable}
        premium={premium}
        dayKey={dayKey}
        premiumCoins={premium ? cotdList.map(toCotdCoin) : []}
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
                drawer: {
                  title: cotd.name,
                  images: (cotd.imageUrls ?? []).filter(Boolean).slice(0, 2),
                  sections: coinDrawerSections(cotd),
                },
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
