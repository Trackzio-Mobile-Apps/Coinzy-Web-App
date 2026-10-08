# Coinzy Web — Pages Checklist

Figma file: `YV6ArWhD2eVlLPH6M090gc` (canvas `793:76525`). Node IDs below are for `get_design_context`.

## Homepage / signed-in (Timeline task 4)
- [x] Free user dashboard — `1898:205770` → `app/home/page.tsx` (post login/signup/guest; `/` and `/auth` redirect when `coinzy_session` is set; Coin of the day + Global catalogue widgets use live API)
- [x] Coin of the Day Premium upsell popup — `1248:114479` → `components/home/PremiumUpsellDialog.tsx` (opened from the home lock line and the drawer's "Show more coins")
- [x] Coin of the Day drawer (free user) — `1248:123835` → `components/home/CoinOfTheDayDrawer.tsx` (opened by "Learn more" on `/home`; live `coins-of-the-day` data)
- [x] Premium home — `1584:205526` → `/home` Premium variant (`HomeDashboard premium`); gated by `getPremiumStatus` + dev-only `?premium=1` (no documented plan flag yet)
- [x] Premium Coin of the Day (multi-coin panel + drawer) — `1248:98330` → `components/home/PremiumCoinOfTheDay.tsx`, `CoinOfTheDayDrawer` `pro` variant
- [x] Premium daily-limit alert ("final popup") — `1912:211426` → `components/home/DailyLimitDialog.tsx`
- [ ] Premium timeline task 5 remainder: real entitlement flag, expert prompt

## Landing (`Landing page/main`)
- [x] Landing page/opt2 — `1050:196584` → `app/page.tsx`
- [x] Landing page/India variant — `1526:302784` → applied to `app/page.tsx` (home)
- [x] Wire nav/footer links to real routes — top nav "Identify" → `/#identify`; `/home` sidebar: real routes for Home/Marketplace/Catalogue, unbuilt items disabled ("Coming soon") until their pages ship. Still open: footer "About" + social icons (no URLs/page decided)

## Auth and login — Timeline task 3 (Account access)
- [x] Welcome/auth entry screen — `1758:121426` → `app/auth/page.tsx` (all web Try Coinzy AI CTAs → `/auth`; email/login screens connected; email/guest APIs connected; Google disabled for now)
- [x] Email sign-up UI — `1422:287605` → `/auth?mode=signup`
- [x] Email login UI — `1422:293465` → `/auth?mode=login`
- [x] Forgot password UI — `1422:305108` → `/auth?mode=forgot`
- [x] Reset OTP UI — `1425:307885` → `/auth?mode=otp` (code passed to reset API; real resend with a 30-second UI cooldown)
- [x] New password UI — `1425:310892` → `/auth?mode=reset` (backend reset + matching-password validation; OTP is verified on submission)
- [x] Auth error UI — section `1758:124172` (unregistered email, incorrect password, invalid OTP, mismatched passwords)
- [x] Connect email signup/login, guest, forgot/reset APIs and HTTP-only session cookies — contract in `docs/auth-api.md`
- [ ] Google sign-in — disabled for now by user decision (not planned on web)
- [x] **Logged-out auth entry** — product uses full-page `/auth` with `?next=` (not Figma `908:*` / `905:*` modals; those pop-ups are **out of scope** for web)
- [x] Contact details modal (signed-in "Contact seller") — `1356:164759` → `ContactDetailsDialog` on `/marketplace/listing/[id]`

Figma auth modals (`908:39186`, `908:39439`, `908:39567`, `905:38594`, `905:38801`, `908:43240`, etc.) are Android/design reference only — web does not implement them. Identification screens remain in timeline tasks 6–7.

## Marketplace
- [x] MarketplacePage (logged out) — `793:77834` → `app/marketplace/page.tsx` when no session (landing rows + browse)
- [x] Signed-in marketplace browse — `1356:154252` → `MarketplaceSignedInPage` on `/marketplace` when session present; `filterItems` → `MarketplaceFilterPanel`; category slugs redirect here with `?category=`
- [x] MarketplacePage/CoinListings (logged out) — `793:77612` → `app/marketplace/[slug]/page.tsx` (live prod API; slugs in `lib/marketplace/categories.ts`; title search `?q=` — search UI not in this Figma frame, built on the dashboard search pill; SellBar `1715:31687` → `/auth?next=` when logged out)
- [x] CoinListings/DetailsPage — `843:15466` → `app/marketplace/listing/[id]/page.tsx` (live prod API; linked from listing grids + marketplace rows; breadcrumb round-trips `?fromQ=`)
- [x] `/home` marketplace panel chips + search (`1898:205770`) — chips filter live rows; "British coins" → `british-coins` (empty today)

## Global Catalogue
- [x] CataloguePage — `797:30404` → `app/catalogue/page.tsx` (+ name search `?q=`; Figma shows no search UI — built on the dashboard search pill, see INDEX.md)
- [x] CataloguePage/SelectedCategory — `797:33107` → `app/catalogue/[slug]/page.tsx` (live API filters; chip row `1386:252333`; `?q=` search composes with the category)
- [x] CataloguePage/DetailsPage — `797:35810` → `app/catalogue/coin/[id]/page.tsx` (live `getDetails` API; breadcrumb round-trips `?fromQ=`)
- [x] Catalogue coin details (signed-in, free) — `1348:137792` → blurred tabs + inline Premium overlay on Design & Material / History / Rarity
- [x] Catalogue coin details (signed-in, Premium) — `1341:249499` → full tabs; dev preview `?premium=1` when signed in (same as `/home`)
- [x] Wishlist heart on catalogue grid + coin details — `PUT/DELETE /archetypes/wishlist/*` via `/api/catalogue/wishlist/[id]`; logged-out → `/auth?next=`

## Blogs
- [x] BlogsPage — `822:23268` → `app/blogs/page.tsx` (category chips + load more via URL params)
- [x] BlogsPage/Read (article) — `828:40221` → `app/blogs/[slug]/page.tsx` (6 static posts in `lib/blogs.ts`)

## Our other apps
- [x] Our other apps page — `876:23169` → `app/other-apps/page.tsx` ("Explore" → trackzio.com/apps/*, "Get the app" → Google Play; TCG/Vinyl/Birds "Coming soon")

## Collections (signed-in)
- [x] Collections home — `1341:262557` → `app/collection/page.tsx`
- [x] System collection grid + filters — `1341:264828` · `1344:117106` → `app/collection/[bucket]/page.tsx`
- [x] Private collection grid — `app/collection/c/[id]/page.tsx`
- [x] Collection coin details — `1348:175552` · `1344:118250` → `app/collection/coin/[id]/page.tsx` (`GET /coin/getDetails/:id`)
- [x] Empty state — `1346:113133` → `CollectionEmptyState`
- [x] Free-user collection coin details — tab blur + Premium overlay on `/collection/coin/[id]` via shared `CoinDetailTabs` (same gate as catalogue `1348:137792`; dev `?premium=1`). Checklist node `1349:146447` is the **home Webapp** shell in Figma, not this screen — use `1348:175552` for layout QA.
- [x] Sell from collection — `1349:128590` · `1349:130692` · `1349:142237` · `1349:142656` → `CollectionSellDrawer` + `POST /api/marketplace/sell/private/[coinId]`
- [x] Create collection — `/collection` add tile + identify modal (`POST /api/collections/add`)
- [ ] Edit / rename private collection — **cancelled for web**
- [x] Remove coin from collection — coin details ⋯ menu → confirm (AlertDialog shell; Copy node `4003:20563` not resolvable via MCP) → `DELETE /api/coin/delete/[coinId]`

## Identification flow (section `1831:219131`)
- [x] Signed-in upload + analyse + match list — `/identify` (Figma row: `1828:206837` … `1831:215037`)
- [x] Result coin details + collection prompt — `/identify/coin/[id]` (reuse catalogue details; `1498:259534`, `1492:255248`)
- [x] API — `POST /api/ai/identify-v2` proxy → catalogue `POST /ai/identify-v2`
- [x] Analyse progress `1828:206840`, top matches `1831:215037`, result details `1828:206836`, collection drawer/modals `1301:153660` / `1500:287598`, added toast `1498:257365`
- [x] Identify failure / not-found — Copy `2098:158944` → `IdentifyFailure` (E001/E002/E005/E006, empty matches, or “Coin not detected” reason); expert banner + thumb asset
- [x] Failure toast — Components Failed `1605:468708` / Collection `1349:142656` → `IdentifyToast` (Copy `4003:1154` not in file via MCP)
- [x] Dev black-image debug — `IdentifyDebugBar` **Load black images (force fail)** → plain black PNGs via `loadIdentifyBlankDebugSample`
- [x] Collection add — `GET /api/collections/fetchAll` + `POST /api/coin/add` + `POST /api/collections/add`; select modal `1500:287598` / inline name `1500:287599`; success toast `1498:257365`; Owned row disabled only when user does not own the coin; Identified + private always selectable; `isIdentified` always `true`
- [x] Task 6 (start identification): upload `1828:206837`, flip `1828:206843`, camera/zoom `1828:206846`, blocked camera `1828:206844`, analyse `1828:206840`, free plan rail `1828:206842` (30 scans, local usage), error toasts `1493:236892`, `POST /api/ai/identify-v2`

## Identification flow (legacy section `1383:260617`)
- Superseded by `1831:219131` for signed-in webapp; keep for historical node refs only.

## Not in Figma (from `COINZY-WEB-SPEC.md` Phase 1)
- [ ] Pricing, FAQ, Download, Privacy/Terms — design needed or skip
- [ ] SEO, analytics, deep links (`assetlinks.json`), deploy
