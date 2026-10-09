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
| `docs/experts-api/` | Experts API Docsify mirror (`overview.md` + mobile-user/*); live [docs](https://coinzy-experts-api.trackzio.com/docs/#/README) |

Figma: primary `YV6ArWhD2eVlLPH6M090gc`; **Experts + updated Feed** also in Copy `5hhBNjumI3EaALlyW6ySXa` (Feed `951:87324`, Experts `1049:167922`) · MCP server name `figma`.

---

## Status (9 Oct 2026)

| Area | Progress | Notes |
| --- | --- | --- |
| Home (marketing) | 100% | India landing `1526:302784`; logged-in users redirect to `/home` |
| Signed-in home | 100% | Free-user dashboard Figma `1898:205770` → `/home` |
| Feature landings | 100% | Marketplace, Catalogue, view-all, Other apps, Blogs list + article |
| Account access | 100% | Email/guest/forgot/reset + Google (`Firebase` popup → `POST /api/auth/google` → `auth/social-login/google`) + error UI + Trackzio legal links; logged-out → `/auth?next=` (no `908`/`905` modals) |
| Catalogue browse | 100% | Live API grid, category filters, pagination, name search (`?q=`; not in Figma, API matches whole names only) |
| Coin details | 100% | Live API; Premium tab gating (`1348:137792` / `1341:249499`); signed-in shell; wishlist API on hearts |
| Marketplace browse | 100% | Live prod listings, category pages, pagination, title search (`?q=`), `/home` panel chips + search; Figma has no filter/sort UI (none built) |
| Listing details | 100% | Email/phone contact; signed-in Contact seller modal |
| Create listings | ~95% | Task 14; List a coin → From Owned / identify; seller profile gate; sell drawer; self listing + Remove; Mark as sold UI-only until API |
| Collections | ~90–95% | Browse ~95% (pager pending); manage ~90% (edit/rename cancelled for web) |
| Settings | ~95% | Task 19; `/settings` hub + edit profile / seller / FAQ / feedback / logout / delete; Plan & billing later |
| Feed / Community | ~100% | Tasks 17–18; Figma Copy `951:87324` + Firebase Android parity (`all-posts`, comments, bookmarks, notifications). `/feed` home/empty, create/edit (max 2 images), delete confirm, comments/replies, Saved/My rail, notification + trending. Prod: set `NEXT_PUBLIC_FIREBASE_*` for `coinzy-26a4d` |
| Blogs | 100% | 6 static posts |
| Premium experience | ~75% | Task 5; home + CoTD Premium UI + catalogue Premium tabs (`?premium=1` dev preview); pending: real entitlement JWT, expert prompt |
| Identification | Tasks 6–7 done | `/identify` through `/identify/coin/[id]` (matches, result, collection add). Rate-match dummy. Free-plan scan usage is local until API exposes counts |

Timeline: `coinzy-web-timeline.html` (browser + localStorage) and `coinzy-web-timeline.xlsx`. HTML `sortedTasks()` orders by progress then ID; last synced **9 Oct 2026** (`TIMELINE_SYNC=10`: Feed 17–18 100%, Settings 19 ~95%, create listings ~95%, collections, identify; task 5 ~75%). XLSX Detailed Timeline must stay in task-ID order; only Weekly View is sorted (progress, then ID).

---

## Routes

| Path | Entry | Figma | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `1526:302784` | Marketing landing; redirects to `/home` when `coinzy_session` is set |
| `/home` | `app/home/page.tsx` | `1898:205770` · drawer `1248:123835` | Post-sign-in free-user dashboard (`components/home/`); requires session. Live data: marketplace rows, Coin of the day (first of `coins-of-the-day`; "Unlock N more" only when N>0; honest empty state if the API fails), "Learn more" opens `CoinOfTheDayDrawer` (native `<dialog>` side sheet, no history entry; built server-side via `coinDrawerSections`), Global catalogue (3 live archetypes → `/catalogue/coin/[id]`; static `HOME_CATALOGUE_FALLBACK` only on API failure) Premium variant (`1584:205526`, drawer `1248:98330`, limit alert `1912:211426`): see gating notes below. |
| `/marketplace` | `app/marketplace/page.tsx` | `793:77834` · signed-in `1356:154252` · list menu `1362:168657` · From Owned `1362:171575` | **Logged out:** marketing rows + search → `/marketplace/all?q=`. **Logged in:** `MarketplaceSignedInPage` (sidebar shell, 16-card grid, filter column). **List a coin** → `ListCoinButton` (owned picker / add-new). Filters: `GET /marketplace/listing/filterItems` (`issuer`, `ruler`, `yearOfMinting`, `mintLocation`, `shape`, `material`, `rarity`) → `MarketplaceFilterPanel`; selections in URL (`?issuer=`, `?material=`, …) → `POST …/fetchAll` body via `loadSignedInBrowse`. Clear all keeps `q` + `category`. |
| `/marketplace/[slug]` | `app/marketplace/[slug]/page.tsx` | `793:77612` | `lib/marketplace/categories.ts`; page size 20; `?q=`+`?page=` search (noindex when `q`), honest empty/unavailable states |
| `/marketplace/listing/[id]` | `app/marketplace/listing/[id]/page.tsx` | `843:15466` | Public buyer view; Seller panel; mailto/tel |
| `/marketplace/my-listing/[id]` | `app/marketplace/my-listing/[id]/page.tsx` | Copy `1363:178858` | Owner self listing (session + `isMyListing`); `OwnerListingPanel`; `?listed=1` success toast; Remove → `DELETE /api/marketplace/listing/[id]` |
| `/api/marketplace/listing/[id]` | `app/api/marketplace/listing/[id]/route.ts` | — | Session `DELETE` → marketplace `listing/delete/:id` |
| `/catalogue` | `app/catalogue/page.tsx` | `797:30404` · signed-in shell | Guests: marketing TopNav/Footer. Session → `CatalogueSignedInPage` (AppSidebar + header, chips `?category=`, `?q=`/`?page=`). `loading.tsx` paints title instantly; coin grid streams. Never marketing landing when logged in. |
| `/catalogue/[slug]` | `app/catalogue/[slug]/page.tsx` | `797:33107` | Guests: filter rules → `fetchAll`. Session → redirect `/catalogue?category=<slug>` (app shell). |
| `/catalogue/coin/[id]` | `app/catalogue/coin/[id]/page.tsx` | `797:35810` · `1348:137792` · `1341:249499` | `?from=` (+`fromPage`, `fromQ`); tab Premium gate; session → sidebar + header; `?premium=1` dev preview |
| `/other-apps` | `app/other-apps/page.tsx` | `876:23169` | `lib/otherApps.ts` |
| `/blogs` | `app/blogs/page.tsx` | `822:23268` | `?category=` / `?show=` |
| `/blogs/[slug]` | `app/blogs/[slug]/page.tsx` | `828:40221` | Static `lib/blogs.ts` |
| `/auth` | `app/auth/page.tsx` | task 3 nodes | `AuthFlow`; modes via `?mode=`; field errors `lib/auth/messages.ts` (Figma `1758:124172`); Terms/Privacy → `COINZY_*_URL` in `lib/constants.ts` |
| `/api/auth/[action]` | `app/api/auth/[action]/route.ts` | — | Proxy only; HTTP-only cookies |
| `/settings` | `app/settings/page.tsx` | `1368:256937` · edit `1370:216726` · logout `1370:256025` · delete `2047:263653` | Signed-in Settings hub (`SettingsPanel` + `SettingsAside`). Guests: “Login to view account settings”. Plan & billing stub. |
| `/feed` | `app/feed/page.tsx` | Canvas `783:15969` · `951:87324` · list `1366:257022` | Signed-in community Feed (`FeedPage`). Firestore: `all-posts`, `comments`, `users/{id}/bookmarks`, `notifications`, `report`. Storage: `posts/{id}/images`. Firebase Auth mirrors Android (email/email or anonymous). |
| `/api/auth/me` | `app/api/auth/me/route.ts` | Copy `1363:172631` | `GET`/`PATCH`/`DELETE` → catalogue `auth/me`; PATCH accepts `sellerDetails` and/or `fullName` (+ `syncSellerEmail`). DELETE clears session cookie. `GET` also returns `id` for Feed `user.userId`. |
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | — | Local logout — clears `coinzy_session` only |
| `/api/feedback` | `app/api/feedback/route.ts` | — | Proxies to feedback Lambda (`COINZY_FEEDBACK_URL`); `platform: "Web"` |
| `/api/catalogue/wishlist/[id]` | `app/api/catalogue/wishlist/[id]/route.ts` | — | `PUT` add / `DELETE` remove → catalogue `archetypes/wishlist/*` with `coinzy_session` |
| `/collection` | `app/collection/page.tsx` (+ `loading.tsx`; cards stream behind Suspense) | `1341:262557` | Overview + system/private collection entry points |
| `/collection/[bucket]` | `app/collection/[bucket]/page.tsx` (+ `loading.tsx`) | `1341:264828` · filters `1344:117106` | `owned` / `identified` / `wishlist` grids + filter rail; coins stream behind Suspense |
| `/collection/c/[id]` | `app/collection/c/[id]/page.tsx` (+ `loading.tsx`) | — | Private collection grid via `POST /coin/fetchAll` filter `{ _collection: [id] }`; shell first, coins stream |
| `/collection/coin/[id]` | `app/collection/coin/[id]/page.tsx` | `1348:175552` · sell `1349:128590`–`142656` · Copy Add for Sale `1363:176354` | `GET /coin/getDetails/:id` + optional archetype merge; **free users:** `CoinDetailTabs` blur + Premium overlay (`getPremiumStatus`; dev `?premium=1` like catalogue). ⋯ menu deletes via `DELETE /api/coin/delete/[coinId]`. Sell via `POST /api/marketplace/sell/private/[coinId]` → **catalogue** host (same as auth/coins); listed state reads `marketplace.sale.listingId` + `fetchListingDetailsForSession`. From Owned / List-a-coin: `?list=1` → `autoOpenSell` (after seller profile gate). Success → `/marketplace/my-listing/[id]?listed=1` |
| `/api/marketplace/sell/private/[coinId]` | `app/api/marketplace/sell/private/[coinId]/route.ts` | — | Session proxy to `POST /marketplace/sell/private/:id` on `COINZY_API_ORIGIN` (not prod browse host); origin check + trimmed `coinId` validation. Listing failure toast: `IdentifyToast` (Figma Failed `1605:468708` / `1349:142656`) |
| `/api/coin/fetchAll` | `app/api/coin/fetchAll/route.ts` | — | Session proxy `POST` → catalogue `POST /coin/fetchAll`; used by From Owned picker (`isOwned: [true]`). Origin check + `coinzy_session` |
| `/identify` | `app/identify/page.tsx` | `1831:219131` · free plan `1828:206842` · failure Copy `2098:158944` | Session required; client flow in `components/identify/IdentifyApp.tsx`. Side rail **Free plan** card (`IdentifyFreePlanCard`): **30** scan cap (Figma); usage in `localStorage` until API exposes counts — not on `auth/me` today. Failure step (`IdentifyFailure`) for E001/E002/E005/E006, empty matches, or reason text like “Coin not detected” (API often omits `aiErrorCode`). Toast for limits / generic errors. Dev: `?debug=1` or **Load sample photos** / **Load black images (force fail)** (plain black PNGs) via `IdentifyDebugBar` + `lib/identify/debugSamples.ts` |
| `/identify/coin/[id]` | `app/identify/coin/[id]/page.tsx` | `1828:206836` | Archetype photos (DB) + right rail user uploads from `sessionStorage`; collection flow in `IdentifyCoinClient` / `IdentifyCollectionUI` |
| `/api/coin/add` | `app/api/coin/add/route.ts` | — | Session `POST /coin/add`; custom collections require body `_collection` (see `docs/coinid-api.md`) |
| `/api/coin/delete/[coinId]` | `app/api/coin/delete/[coinId]/route.ts` | — | Session `DELETE /coin/delete/:id`; collection details ⋯ → confirm (`CollectionCoinOverflowMenu`) |
| `/api/collections/fetchAll` | `app/api/collections/fetchAll/route.ts` | — | Session `GET /collections/fetchAll` (identified/owned + private lists for select modal) |
| `/api/collections/add` | `app/api/collections/add/route.ts` | — | Session `POST /collections/add` body `{ name }` — see `docs/coinid-api.md` · Custom collections; `/collection` add tile + identify modal (Done saves pending name if expanded, not only Enter) |
| `/api/ai/identify-v2` | `app/api/ai/identify-v2/route.ts` | — | Multipart `files` (×2) → `COINZY_API_ORIGIN` `/ai/identify-v2` with `coinzy_session` |

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
- `lib/api/marketplace-session.ts` — **server-only** marketplace session helpers: `sellPrivateCoin`, `fetchListingDetailsForSession` (owner `isMyListing` / `coinId`), `deleteListing`. All hit **`COINZY_API_ORIGIN`** (auth/private-coin host). Guest browse of public listings stays on `COINZY_MARKETPLACE_API_ORIGIN` in `coinzy.ts`.
- `lib/marketplace/selfListing.ts` — `selfListingPath(id)` → `/marketplace/my-listing/[id]`; `collectionSellHref(coinId)` → `/collection/coin/[id]?from=marketplace&list=1`.
- `lib/api/auth-session.ts` — **server-only** `GET`/`PATCH auth/me` on the auth/catalogue origin (`fetchAboutMe`, `updateSellerDetails`). Seller profile is **not** on the marketplace listings host.
- `components/marketplace/SetSellerProfileDialog.tsx` + `useSellerProfileGate.tsx` — Set Seller Profile modal (Figma Copy `1363:172631`); call `ensureSellerProfile()` before sell/list and render `profileDialog`. Completeness = `sellerDetails.name` + valid `contactEmail` (not `user.isProfileComplete`).
- `lib/marketplace/sellerProfile.ts` — form validation + `isSellerProfileComplete`.
- `components/collection/CollectionSellDrawer.tsx` + `CollectionCoinSellActions.tsx` — Add for Sale drawer (Copy `1363:176354` / `1349:128590`, validation `1349:130692`); profile gate then drawer; success → `/marketplace/my-listing/[id]?listed=1`. `OwnerListingPanel` / `CollectionListedSellerRail` — Remove wired to `DELETE /api/marketplace/listing/[id]`; Mark as sold still UI-only (no upstream API).
- `components/marketplace/ListCoinButton.tsx` + `SelectOwnedCoinDialog.tsx` — signed-in List a coin menu (Copy `1362:168657`) and From Owned modal (`1362:171575`). Default owned handoff → `/collection/coin/[id]?from=marketplace&list=1`. **Add new coin** defaults to `/identify`. Icons under `public/assets/marketplace/icon-{owned-grid,camera,radio-on,radio-off}.svg`.
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
- `/home` sidebar (`components/home/AppSidebar.tsx`, items in `lib/sidebarNav.ts`): **Identify** → `/identify`; **Feed** → `/feed`; **Settings** → `/settings`. Still `soon: true`: Expert analysis. Landing top-nav "Identify" is `/#identify` so it works from sub-pages. Known open: footer "About" and social icons still `#`.
- **Firebase / Feed:** Client SDK only (`lib/firebase/*`, `lib/feed/*`). Dev defaults = Console web app for `coinzy-dev` (also in `.env.local`). Prod must set `NEXT_PUBLIC_FIREBASE_*` for `coinzy-26a4d`. Auth bridge: email/password with password === email (Android), guests anonymous. Post author id = Coinzy `user.id` from `GET /api/auth/me`, not Firebase UID.
- `fetchArchetypes({ pageNo: 0, pageSize: 3 })` on `/home` — list items carry `archetypeId, name, issuer, rarity, imageUrls` only (no year / `estimatedPrice`), so card subtitle = issuer (falls back to price span or issuer · year if the API ever sends them).
- `lib/catalogue/categories.ts` / `lib/marketplace/categories.ts` — slug → regex/filter rules.
- `lib/catalogue/coinDetails.ts` — grade labels, price ranges; accepts string **or** number API fields; `estimatedSpan` = lowest–highest across all grades.
- `lib/auth/client.ts` → browser; cookies set only by the auth route handler.
- `lib/auth/session.ts` — server helper; reads `coinzy_session` and decodes display name/email from the JWT.

### Assets

Runtime under `public/assets/<area>/` (landing numbered folders `01-top-nav`…`11-footer`, plus `marketplace/`, `catalogue/`, `coin-details/`, `auth/`, `blogs/`, `other-apps/`, `shared/`). Design exports also under `design/`.

---

## Gotchas (keep)

- **Create listing 404:** `POST /marketplace/sell/private/:id` must use `COINZY_API_ORIGIN` (catalogue) with the session JWT — same host as private coins / `auth/me`. Calling prod (`COINZY_MARKETPLACE_API_ORIGIN`) returns **404** `Coin not found or you don't own this coin` even when `/collection/coin/[id]` loads fine. Android uses one `BASE_URL` for both. Side effect: newly created listings live on catalogue (often empty for guest browse); public `/marketplace` still reads prod inventory.

- **Custom collection membership:** `POST /coin/add` must send **`_collection`** (collection id). `collectionId` is ignored. List coins with `POST /coin/fetchAll` body `{ "_collection": ["<id>"] }`. Home-card thumbs use `representativeImages` from `GET /collections/fetchAll` — empty until coins are linked correctly.
- **Figma node `1349:146447`:** MCP metadata/screenshots show the signed-in **home Webapp** (`/home`), not collection coin details — do not use it for `/collection/coin/[id]` pixel QA; use `1348:175552` / catalogue free gate `1348:137792` for tabs.
- **Local dev:** Use **http://localhost:3000** only. If Next picks another port, stop duplicate `npm run dev` processes, free 3000, then restart once. After `npm run build` while dev was running (or **every route returns plain `500 Internal Server Error`**, random 500s / `.next` ENOENT), stop dev → `rm -rf .next` → `npm run dev` again. Run **`npm run build`** before merge — it typechecks the whole app (e.g. identify `addCoinViaApi` expects `AddCoinRequestBody` end-to-end).
- Fonts: Geist/Jakarta `next/font` variables must sit on `<html>` — `--font-sans` in `@theme` resolves on `:root`.
- Figma icon exports are unreliable (hearts/arcs/wrong hashes). Prefer hand-written Hugeicons (`icons/shared/`, area folders). Eyeball MCP downloads.
- After replacing an image under the same name, delete `.next/cache/images`.
- Hero coin must cover baked-in Zeus on `02-hero/background-texture-layer-2.jpeg` at every breakpoint (no `hidden xl:block` on the crab coin).
- Image caching: API/S3 through Next optimizer; `minimumCacheTTL` 30d; `/assets/*` headers in `next.config.ts`. Add new remote hosts to `images.remotePatterns`.
- `getDetails` field types differ by tranche (strings vs numbers) — normalize in view-models.
- Details streaming returns HTTP 200 + `noindex` for unknown coins (Suspense).
- Marketplace listings: fetch-all + local newest-first sort (API sort is title/price only); ~207 prod listings (5 Oct 2026).
- Auth: Google via Firebase popup → Google ID token → `/api/auth/google` → upstream `auth/social-login/google` (same `GLogin` as Android); then Feed Firebase bridge uses email/password (`password === email`). OTP has no standalone verify API (code goes to reset as `token`); `coinzy_guest_id` reused on guest + forwarded on signup/Google. Catalogue guest client is independent of browser session cookies. Enable **Google** under Firebase Auth → Sign-in method; authorize `localhost` (and prod host).
- Tests: `node tests/auth-api.cjs` for auth proxy/cookies/origin. Auth `POST` rejects mismatched `Origin` (CSRF); in dev, `localhost` and `127.0.0.1` on the same port are treated as equivalent (`lib/auth/origin.ts`). Production aliases (e.g. `www`) → `COINZY_ALLOWED_ORIGINS` comma-separated full origins.

### Back-navigation rules

- **Never `router.back()`** — in-page back controls are deterministic `<Link>`s; the browser Back button works because every list/pager/filter control is a pushing `<Link>`.
- **Details pages** take `?from=<origin>[&fromPage=N]` (`lib/backNav.ts`: `withFrom`, `pagedHref`, `parsePageParam`, `parseQueryParam`). Searched catalogue lists also pass `fromQ=<term>`, so the breadcrumb/back link returns to the same results. `catalogue/coin/[id]`: `home`, `catalogue` (→ `/catalogue?q=&page=N#browse-all`), or a view-all slug (→ `/catalogue/<slug>?q=&page=N`). `marketplace/listing/[id]`: `home`, `marketplace`, or a marketplace slug (+page). `blogs/[slug]` takes `?category=&show=` (validated; makes article pages dynamic) so the breadcrumb returns to the exact list. `/home` widgets pass `from=home` (breadcrumb "Home" → `/home`). New list → details links must pass `from`/`fromPage`.
- **Auth wizard = one history entry**: step changes inside `/auth` use `router.replace` / `<Link replace>`; the on-page "Back" link (explicit hrefs) steps back. After login/signup/guest, `goHome(next?)` (`lib/auth/client.ts`) does `window.location.replace(safeReturnPath(next) ?? "/home")` (hard load clears the SPA router cache). `/auth?next=` carries a validated same-origin return path (`lib/auth/returnTo.ts` — blocks `/auth`, `/api`, open redirects). Marketplace listing **Contact seller** sends logged-out visitors to `/auth?next=/marketplace/listing/<id>?…` so they land back on the listing after sign-in. Entries before `/auth` (e.g. landing `/`) still redirect to `/home` once — unavoidable while `/` and `/auth` redirect signed-in users.
- **Marketplace listing — Contact seller** (Figma `1356:164759`): signed-in viewers (guests included) open `ContactDetailsDialog` (phone, email, Send email). Logged-out visitors never receive `contactEmail` / `phoneNumber` in the RSC payload (`app/marketplace/listing/[id]/page.tsx` redacts before props); seller fields show "Log in to view" and the button links to auth with `next`. Logged-out **auth** modals (`905:38594`, `908:43240`) are out of scope on web — `/auth?next=` is intentional.
- `/`, `/auth`, `/home`, `/settings` read `coinzy_session` via `cookies()` → dynamic, `Cache-Control: no-store` (verified). `ReloadOnRestore` reloads them on bfcache restore (`pageshow.persisted`). Sign-out: `POST /api/auth/logout` then hard `location.replace("/")` (not `router.push`) so the router cache can't show a signed-in shell.
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
