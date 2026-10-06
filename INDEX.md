# Coinzy Web — Project Index

Living map for humans and agents. **Agent rules:** `AGENTS.md` (shared), `CLAUDE.md` (Claude), `.cursor/rules/` (Cursor). Codex reads `AGENTS.md`. Update this file when routes, APIs, or hard-won gotchas change.

| Doc | Role |
| --- | --- |
| `AGENTS.md` | Coding rules for Cursor / Claude / Codex |
| `CLAUDE.md` | Claude entry → points at AGENTS + Figma MCP notes |
| `.cursor/rules/*.mdc` | Cursor scoped rules (core, Next, API, Figma) |
| `PAGES-CHECKLIST.md` | Figma node IDs + build status |
| `COINZY-WEB-SPEC.md` | Product/tech plan (older; prefer this index for “what exists”) |
| `docs/coinid-api.md` | Catalogue/coin API |
| `docs/auth-api.md` | Auth contract (from Android) |

Figma: `YV6ArWhD2eVlLPH6M090gc` · MCP server name `figma`.

---

## Status (5 Oct 2026)

| Area | Progress | Notes |
| --- | --- | --- |
| Home | 100% | India landing `1526:302784` |
| Feature landings | 100% | Marketplace, Catalogue, view-all, Other apps, Blogs list + article |
| Account access | ~75% | Email/guest/forgot/reset live; Google off; entry pop-ups pending |
| Catalogue browse | ~50% | Live API; search pending |
| Coin details | ~75% | Live API; premium pending |
| Marketplace browse | ~50% | Live prod listings; search/filter UI pending |
| Listing details | 100% | Email/phone contact |
| Blogs | 100% | 6 static posts |
| Identification | 0% | Tasks 6–7; not started |

Timeline: `coinzy-web-timeline.html` (browser + localStorage) and `coinzy-web-timeline.xlsx`. HTML `sortedTasks()` orders by progress then ID; XLSX progress = Detailed Timeline col G (row = task id + 1).

---

## Routes

| Path | Entry | Figma | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `1526:302784` | `components/landing/*` + `lib/constants.ts` |
| `/marketplace` | `app/marketplace/page.tsx` | `793:77834` | Rows via `MARKETPLACE_LISTING_ROWS`; live row loader |
| `/marketplace/[slug]` | `app/marketplace/[slug]/page.tsx` | `793:77612` | `lib/marketplace/categories.ts`; page size 20 |
| `/marketplace/listing/[id]` | `app/marketplace/listing/[id]/page.tsx` | `843:15466` | Seller panel; mailto/tel |
| `/catalogue` | `app/catalogue/page.tsx` | `797:30404` | Browse-all live (`?page=`) |
| `/catalogue/[slug]` | `app/catalogue/[slug]/page.tsx` | `797:33107` | Filter rules → `fetchAll` |
| `/catalogue/coin/[id]` | `app/catalogue/coin/[id]/page.tsx` | `797:35810` | `?from=` breadcrumb; Suspense stream |
| `/other-apps` | `app/other-apps/page.tsx` | `876:23169` | `lib/otherApps.ts` |
| `/blogs` | `app/blogs/page.tsx` | `822:23268` | `?category=` / `?show=` |
| `/blogs/[slug]` | `app/blogs/[slug]/page.tsx` | `828:40221` | Static `lib/blogs.ts` |
| `/auth` | `app/auth/page.tsx` | task 3 nodes | `AuthFlow`; modes via `?mode=` |
| `/api/auth/[action]` | `app/api/auth/[action]/route.ts` | — | Proxy only; HTTP-only cookies |

Active nav: `components/landing/NavLinks.tsx` (`usePathname`).

---

## Key modules

### UI shells

- `SectionShell` — `background` for full-bleed layers; children in 1440px column. Override padding with `innerClassName` + `!`.
- `SectionHeader` — Figma SectionLabel (12px light label → 24px medium title).
- `PageHero` / `HeroBanner` — shared heroes (marketplace/catalogue/other-apps).
- `FallbackImage` + `CoinPlaceholder` — remote coin photos / empty states.
- `DetailsBreadcrumb`, `CoinPhotos` — `components/catalogue/DetailsParts.tsx`.

### Data / API

- `lib/api/coinzy.ts` — **server-only**. Catalogue origin `COINZY_API_ORIGIN` → `https://coins-api.trackzio.com`; marketplace `COINZY_MARKETPLACE_API_ORIGIN` → `https://coins-api-prod.trackzio.com`. Guest token per backend; never send to browser. Auth at `/auth/*`, data at `/api/*`.
- `fetchArchetypes` / `fetchFilterValues` / `fetchArchetypeDetails` / `fetchListingDetails` / `fetchAllListings` — see file for cache tags (`archetype-details`, `listing-details`, `marketplace-listings`).
- `lib/catalogue/categories.ts` / `lib/marketplace/categories.ts` — slug → regex/filter rules.
- `lib/catalogue/coinDetails.ts` — grade labels, price ranges; accepts string **or** number API fields.
- `lib/auth/client.ts` → browser; cookies set only by the auth route handler.

### Assets

Runtime under `public/assets/<area>/` (landing numbered folders `01-top-nav`…`11-footer`, plus `marketplace/`, `catalogue/`, `coin-details/`, `auth/`, `blogs/`, `other-apps/`, `shared/`). Design exports also under `design/`.

---

## Gotchas (keep)

- Fonts: Geist/Jakarta `next/font` variables must sit on `<html>` — `--font-sans` in `@theme` resolves on `:root`.
- Figma icon exports are unreliable (hearts/arcs/wrong hashes). Prefer hand-written Hugeicons (`icons/shared/`, area folders). Eyeball MCP downloads.
- After replacing an image under the same name, delete `.next/cache/images`.
- Hero coin must cover baked-in Zeus on `02-hero/background-texture-layer-2.jpeg` at every breakpoint (no `hidden xl:block` on the crab coin).
- Image caching: API/S3 through Next optimizer; `minimumCacheTTL` 30d; `/assets/*` headers in `next.config.ts`. Add new remote hosts to `images.remotePatterns`.
- `getDetails` field types differ by tranche (strings vs numbers) — normalize in view-models.
- Details streaming returns HTTP 200 + `noindex` for unknown coins (Suspense).
- Marketplace listings: fetch-all + local newest-first sort (API sort is title/price only); ~207 prod listings (5 Oct 2026).
- Auth: Google disabled; OTP has no standalone verify API (code goes to reset as `token`); `coinzy_guest_id` reused on guest + forwarded on signup. Catalogue guest client is independent of browser session cookies.
- Tests: `node tests/auth-api.cjs` for auth proxy/cookies/origin.

---

## Section → component cheat sheet (home)

| Section | Component | Figma |
| --- | --- | --- |
| Nav | `TopNav` / `NavLinks` | — |
| Hero | `HeroSection` | `1643:63328` |
| Identify demo | `IdentifyDemoSection` | `1526:302790` |
| Categories | `BrowseCatalogueSection` | `1526:302894` |
| Marketplace strip | `MarketplaceSection` | `1526:304316` |
| Mobile app | `MobileAppSection` | `1526:304346` |
| Collection CTA | `CollectionCTASection` | `1526:304347` |
| Experts | `ExpertEvaluationSection` | `1526:304385` |
| Community | `CommunityFeedSection` | `1526:304490` |
| Footer | `Footer` | `1526:304542` |

Data for landing copy/lists: `lib/constants.ts`. Favicon: `app/icon.png` + `app/apple-icon.png`.
