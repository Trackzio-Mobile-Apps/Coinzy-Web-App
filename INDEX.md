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

## Status (6 Oct 2026)

| Area | Progress | Notes |
| --- | --- | --- |
| Home (marketing) | 100% | India landing `1526:302784`; logged-in users redirect to `/home` |
| Signed-in home | 100% | Free-user dashboard Figma `1898:205770` → `/home` |
| Feature landings | 100% | Marketplace, Catalogue, view-all, Other apps, Blogs list + article |
| Account access | ~75% | Email/guest/forgot/reset live; Google off; entry pop-ups pending |
| Catalogue browse | 100% | Live API grid, category filters, pagination, name search (`?q=`; not in Figma, API matches whole names only) |
| Coin details | ~75% | Live API; premium state pending — no Figma node exists for it |
| Marketplace browse | 100% | Live prod listings, category pages, pagination, title search (`?q=`), `/home` panel chips + search; Figma has no filter/sort UI (none built) |
| Listing details | 100% | Email/phone contact |
| Blogs | 100% | 6 static posts |
| Premium experience | 60% | Task 5; Premium home, multi-coin Coin of the Day and daily-limit alert built (dev-only `?premium=1` preview; no documented plan flag); Premium coin details + expert prompt pending |
| Identification | 0% | Tasks 6–7; not started |

Timeline: `coinzy-web-timeline.html` (browser + localStorage) and `coinzy-web-timeline.xlsx`. HTML `sortedTasks()` orders by progress then ID; XLSX progress = Detailed Timeline col G (row = task id + 1). Last synced 6 Oct 2026 (task 4 done 6 Oct; tasks 1, 2, 13, 23 done 5 Oct; forecast finish 29 Oct, 24% overall). XLSX Detailed Timeline must stay in task-ID order (formulas read earlier rows by position); only Weekly View is sorted (progress, then ID). Git history is all dated 6 Oct, so completion dates before that come from the timeline's own records.

---

## Routes

| Path | Entry | Figma | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `1526:302784` | Marketing landing; redirects to `/home` when `coinzy_session` is set |
| `/home` | `app/home/page.tsx` | `1898:205770` · drawer `1248:123835` | Post-sign-in free-user dashboard (`components/home/`); requires session. Live data: marketplace rows, Coin of the day (first of `coins-of-the-day`; "Unlock N more" only when N>0; honest empty state if the API fails), "Learn more" opens `CoinOfTheDayDrawer` (native `<dialog>` side sheet, no history entry; built server-side via `coinDrawerSections`), Global catalogue (3 live archetypes → `/catalogue/coin/[id]`; static `HOME_CATALOGUE_FALLBACK` only on API failure) Premium variant (`1584:205526`, drawer `1248:98330`, limit alert `1912:211426`): see gating notes below. |
| `/marketplace` | `app/marketplace/page.tsx` | `793:77834` · signed-in `1356:154252` | **Logged out:** marketing rows + search → `/marketplace/all?q=`. **Logged in:** `MarketplaceSignedInPage` (sidebar shell, 16-card grid, filter column). Filters: `GET /marketplace/listing/filterItems` (`issuer`, `ruler`, `yearOfMinting`, `mintLocation`, `shape`, `material`, `rarity`) → `MarketplaceFilterPanel`; selections in URL (`?issuer=`, `?material=`, …) → `POST …/fetchAll` body via `loadSignedInBrowse`. Clear all keeps `q` + `category`. |
| `/marketplace/[slug]` | `app/marketplace/[slug]/page.tsx` | `793:77612` | `lib/marketplace/categories.ts`; page size 20; `?q=`+`?page=` search (noindex when `q`), honest empty/unavailable states |
| `/marketplace/listing/[id]` | `app/marketplace/listing/[id]/page.tsx` | `843:15466` | Seller panel; mailto/tel |
| `/catalogue` | `app/catalogue/page.tsx` | `797:30404` | Browse-all live (`?page=`, `?q=`); `CatalogueSearch` beside "View all", results in Suspense + skeleton |
| `/catalogue/[slug]` | `app/catalogue/[slug]/page.tsx` | `797:33107` | Filter rules → `fetchAll`; `?q=` search + `?page=`; search pill left of the chips; count/grid stream behind Suspense |
| `/catalogue/coin/[id]` | `app/catalogue/coin/[id]/page.tsx` | `797:35810` | `?from=` (+`fromPage`, `fromQ`) breadcrumb; Suspense stream |
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
- `fetchCoinsOfTheDay(todayKey())` — `GET /archetypes/coins-of-the-day` (3 ULTRA_RARE archetypes, details-shaped; `estimatedPrice` is often `{}` → UI shows "NA"). `unstable_cache` keyed by UTC day (6h TTL, tag `coins-of-the-day`); empty answers throw so they're never cached. Only `/home` uses it (no other Figma node calls for it; premium variant is timeline task 5).
- **Marketplace search** (`?q=` on `/marketplace/[slug]` and signed-in `/marketplace`; `/home` panel → `/marketplace/all?q=`): `fetchAllListings(filters, search)` → `POST /api/marketplace/listing/fetchAll?search=<term>` + filter body. **Verified live (6 Oct 2026, 207 listings): case-insensitive, whole-word title match.** Logged-out category pages: Figma `793:77612` has no search in-frame — pill reuses `CatalogueSearch`. **Signed-in** browse (`1356:154252`): filter column from `GET /marketplace/listing/filterItems`, toggles in URL (`lib/marketplace/listingFilters.ts`). Logged-out `/marketplace/[slug]` redirects to signed-in browse when a session exists.
- **`/home` marketplace panel**: chips are links to `/home?market=<slug>` (server re-render, `scroll={false}`, `premium=1` preserved); rows come from `loadListingPage(def,1,4)` + `fetchArchetypeDetails` (year • issuer • rarity — listing summaries carry none of these; listings without an `archetypeId` show only the parts available). Search submits to `/marketplace/all?q=`. The Figma "British coins" chip is the real `british-coins` category (UK issuer) — **empty today** (no UK-issuer listings; "British India" excluded), shows an honest empty message.
- **Catalogue search** (`?q=` on `/catalogue` and `/catalogue/[slug]`): `POST /archetypes/fetchAll?search=<term>` + the category filter body. **Verified live (6 Oct 2026): the API behaves as a case-sensitive whole-name match**, not the documented case-insensitive contains — `Dollar` 362, `dollar` 0, `Morgan Dollar` 63, `Morgan` 0, `Dolla` 0; with `american-coins` filters `Dollar` → 267; with rarity RARE/ULTRA_RARE → 18. `lib/catalogue/search.ts` `searchVariants` tries as-typed, Title Case, lower case and keeps the first with hits. `loadCoins({ search })` (`CoinGrid.tsx`) uses `fetchArchetypesCached` (`unstable_cache`, tag `archetype-list`, key = page/size/search/filters, 1h). `parseQueryParam` (`lib/backNav.ts`) trims, strips control chars and caps at 80. Search is submit-on-Enter (`CatalogueSearch`, the only client piece; the Figma frames have **no** search input, so it reuses the dashboard's 24px search pill), results are server-rendered inside `Suspense key=q|page` with `CoinGridSkeleton`; `CatalogueEmpty` covers no-results and API-down (a search never falls back to fake sample coins). `?q=` pages are `noindex`. The `/home` marketplace search input is still a non-functional placeholder.
- `components/home/PremiumUpsellDialog.tsx` — client; centred 382px "More knowledge, more fun!" Premium upsell modal (Figma `1248:114479`; despite being requested as the "pro popup" this node is the free-user upsell, not a pro drawer). Native `<dialog>` via `components/ui/useModalDialog.ts` (showModal, Esc, scroll lock). Needs `m-auto` (Tailwind preflight zeroes the UA dialog margin). "Go Premium" → `/home#premium`. No premium/pro flag exists in the session yet, so there is no pro drawer variant. Assets: `public/assets/home/premium-crown.svg`, `icon-close-white.svg`.
- `components/home/CoinOfTheDayDrawer.tsx` — client; "Coin of the day" 585px side drawer (Figma `1248:123835`). Props are a serializable view-model (`coinDrawerSections` in `lib/catalogue/coinDetails.ts`: Overview · Design & Material · Rarity · History); never import `lib/api/coinzy.ts` there. Trigger is a real `<Link>` to the coin details page (`?from=home`), intercepted on plain left-click. Footer ("Show more coins", opens the Premium upsell) only when `lockedCount > 0`. The drawer component also renders the home-panel lock line (`Unlock N more with Premium`, button → upsell) when `lockedCount > 0`; focus returns to "Learn more" if the upsell was opened from the drawer, else to the lock button. Esc / backdrop / close button close it; focus returns to the trigger. Icons: `public/assets/home/icon-close.svg` (hand-written — Figma export was a heart), `icon-crown-16.svg`.
- **Premium home gating** — `getPremiumStatus(user)` in `lib/auth/session.ts` is the single server-side switch; it returns `false` because `docs/auth-api.md` documents no plan/entitlement claim. `app/home/page.tsx` also honours a **dev-only** `?premium=1` override (`NODE_ENV !== "production"`) so the Premium UI can be previewed; it does nothing in production builds. Free users render exactly the free dashboard. Wire the real API/JWT claim into `getPremiumStatus` when it exists.
- `components/home/PremiumCoinOfTheDay.tsx` — client; Premium right-panel widget (Figma `1248:98330`): "{n} left" badge, 60px thumb carousel with prev/next, name + facts, "Learn more". `app/home/page.tsx` builds the serializable `CotdCoin[]` view-model (`toCotdCoin`) from all 1–3 `fetchCoinsOfTheDay` coins ("NA" for missing fields). Reveal count (starts at 1) is kept in `localStorage` key `coinzy:cotd-views:<UTC dayKey>` — a UI-only limit, **not enforcement**.
- `CoinOfTheDayDrawer` takes an optional `pro` prop (`ProDrawerControls`: index/count/left, prev/next, `onShowMore`) for the Premium state: name row arrows, "Show more coins" + "{n} more coins for today", no lock line. `onShowMore()` returning `"limit"` closes the drawer and opens `DailyLimitDialog`.
- `components/home/DailyLimitDialog.tsx` — client; "Oops!" daily-limit alert (Figma `1912:211426`, the "final popup"): shown when a Premium user presses "Show more coins" with 0 left. Single "Okay"/X close; no purchase or subscription flow. Focus returns to "Learn more".
- `components/home/CoinThumb.tsx` — shared `CoinThumb` (round 40/tile 60) + `CoinFacts` used by free and Premium panels.
- `/home` sidebar (`components/home/AppSidebar.tsx`, items in `lib/home.ts` `HOME_NAV`): only items with an `href` are links (Home, Marketplace, Global Catalogue). Pages that don't exist yet (Identify, Expert analysis, Collection, Feed, Settings) are `soon: true` → disabled `<span>` ("Coming soon"); add `href` and drop `soon` when each page ships. Landing top-nav "Identify" is `/#identify` so it works from sub-pages. Known open: footer "About" and social icons still `#`.
- `fetchArchetypes({ pageNo: 0, pageSize: 3 })` on `/home` — list items carry `archetypeId, name, issuer, rarity, imageUrls` only (no year / `estimatedPrice`), so card subtitle = issuer (falls back to price span or issuer · year if the API ever sends them).
- `lib/catalogue/categories.ts` / `lib/marketplace/categories.ts` — slug → regex/filter rules.
- `lib/catalogue/coinDetails.ts` — grade labels, price ranges; accepts string **or** number API fields; `estimatedSpan` = lowest–highest across all grades.
- `lib/auth/client.ts` → browser; cookies set only by the auth route handler.
- `lib/auth/session.ts` — server helper; reads `coinzy_session` and decodes display name/email from the JWT.

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
- Tests: `node tests/auth-api.cjs` for auth proxy/cookies/origin. Auth `POST` rejects mismatched `Origin` (CSRF); in dev, `localhost` and `127.0.0.1` on the same port are treated as equivalent (`lib/auth/origin.ts`). Production aliases (e.g. `www`) → `COINZY_ALLOWED_ORIGINS` comma-separated full origins.

### Back-navigation rules

- **Never `router.back()`** — in-page back controls are deterministic `<Link>`s; the browser Back button works because every list/pager/filter control is a pushing `<Link>`.
- **Details pages** take `?from=<origin>[&fromPage=N]` (`lib/backNav.ts`: `withFrom`, `pagedHref`, `parsePageParam`, `parseQueryParam`). Searched catalogue lists also pass `fromQ=<term>`, so the breadcrumb/back link returns to the same results. `catalogue/coin/[id]`: `home`, `catalogue` (→ `/catalogue?q=&page=N#browse-all`), or a view-all slug (→ `/catalogue/<slug>?q=&page=N`). `marketplace/listing/[id]`: `home`, `marketplace`, or a marketplace slug (+page). `blogs/[slug]` takes `?category=&show=` (validated; makes article pages dynamic) so the breadcrumb returns to the exact list. `/home` widgets pass `from=home` (breadcrumb "Home" → `/home`). New list → details links must pass `from`/`fromPage`.
- **Auth wizard = one history entry**: step changes inside `/auth` use `router.replace` / `<Link replace>`; the on-page "Back" link (explicit hrefs) steps back. After login/signup/guest, `goHome(next?)` (`lib/auth/client.ts`) does `window.location.replace(safeReturnPath(next) ?? "/home")` (hard load clears the SPA router cache). `/auth?next=` carries a validated same-origin return path (`lib/auth/returnTo.ts` — blocks `/auth`, `/api`, open redirects). Marketplace listing **Contact seller** sends logged-out visitors to `/auth?next=/marketplace/listing/<id>?…` so they land back on the listing after sign-in. Entries before `/auth` (e.g. landing `/`) still redirect to `/home` once — unavoidable while `/` and `/auth` redirect signed-in users.
- **Marketplace listing — Contact seller** (Figma `1356:164759`): signed-in viewers (guests included) open `ContactDetailsDialog` (phone, email, Send email). Logged-out visitors never receive `contactEmail` / `phoneNumber` in the RSC payload (`app/marketplace/listing/[id]/page.tsx` redacts before props); seller fields show "Log in to view" and the button links to auth with `next`. Checklist nodes `905:38594` / `908:43240` (logged-out **auth** pop-up) are still pending if product wants a modal instead of `/auth`.
- `/`, `/auth`, `/home` read `coinzy_session` via `cookies()` → dynamic, `Cache-Control: no-store` (verified). `ReloadOnRestore` reloads them on bfcache restore (`pageshow.persisted`). No sign-out exists yet: when added, use a hard navigation to `/` (not `router.push`) so the router cache can't show a signed-in `/home`.
- Blogs "Load more" uses `replace` so repeated clicks don't stack history entries.

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
