# Coinzy Web — Pages Checklist

Figma file: `YV6ArWhD2eVlLPH6M090gc` (canvas `793:76525`). Node IDs below are for `get_design_context`.

## Homepage / signed-in (Timeline task 4)
- [x] Free user dashboard — `1898:205770` → `app/home/page.tsx` (post login/signup/guest; `/` and `/auth` redirect when `coinzy_session` is set; Coin of the day + Global catalogue widgets use live API)
- [x] Coin of the Day Premium upsell popup — `1248:114479` → `components/home/PremiumUpsellDialog.tsx` (opened from the home lock line and the drawer's "Show more coins")
- [x] Coin of the Day drawer (free user) — `1248:123835` → `components/home/CoinOfTheDayDrawer.tsx` (opened by "Learn more" on `/home`; live `coins-of-the-day` data)
- [ ] Premium Coin of the Day / premium home variant (timeline task 5) — no Figma for unlocked/multi-coin state yet

## Landing (`Landing page/main`)
- [x] Landing page/opt2 — `1050:196584` → `app/page.tsx`
- [x] Landing page/India variant — `1526:302784` → applied to `app/page.tsx` (home)
- [ ] Wire nav/footer links to real routes (currently `#` anchors)

## Auth and login — Timeline task 3 (Account access)
- [x] Welcome/auth entry screen — `1758:121426` → `app/auth/page.tsx` (all web Try Coinzy AI CTAs → `/auth`; email/login screens connected; email/guest APIs connected; Google disabled for now)
- [x] Email sign-up UI — `1422:287605` → `/auth?mode=signup`
- [x] Email login UI — `1422:293465` → `/auth?mode=login`
- [x] Forgot password UI — `1422:305108` → `/auth?mode=forgot`
- [x] Reset OTP UI — `1425:307885` → `/auth?mode=otp` (code passed to reset API; real resend with a 30-second UI cooldown)
- [x] New password UI — `1425:310892` → `/auth?mode=reset` (backend reset + matching-password validation; OTP is verified on submission)
- [x] Auth error UI — section `1758:124172` (unregistered email, incorrect password, invalid OTP, mismatched passwords)
- [x] Connect email signup/login, guest, forgot/reset APIs and HTTP-only session cookies — contract in `docs/auth-api.md`
- [ ] Google sign-in — disabled for now by user decision
All auth entry/sign-up prompts are tracked here, regardless of the page that triggers them. Identification screens remain in timeline tasks 6-7; feature-specific evaluation/premium behavior remains in its own task.
- [ ] Pop-up/Feed — `908:39186`
- [ ] Pop-up/ExpertEvaluation (free user → "Get expert evaluation") — `908:39439`, `1796:203077`
- [ ] Pop-up/ListingCoin (logged-out → "Post a listing") — `908:39567`
- [ ] Pop-up/ContactSeller (logged-out) — `905:38594`
- [ ] Pop-up/ListingCoin — `905:38801`
- [ ] Pop-up/ContactSeller — `908:43240`
- [ ] Pop-up — `908:39058`
- [ ] Pop-up/ExpertEvaluation — `1796:203244`
- [ ] SignUp pop-up / Pop-up/ExpertEvaluation — `1385:258887`

## Marketplace
- [x] MarketplacePage — `793:77834` → `app/marketplace/page.tsx`
- [x] MarketplacePage/CoinListings — `793:77612` → `app/marketplace/[slug]/page.tsx` (live prod API; slugs in `lib/marketplace/categories.ts`)
- [x] CoinListings/DetailsPage — `843:15466` → `app/marketplace/listing/[id]/page.tsx` (live prod API; linked from listing grids + marketplace rows)

## Global Catalogue
- [x] CataloguePage — `797:30404` → `app/catalogue/page.tsx`
- [x] CataloguePage/SelectedCategory — `797:33107` → `app/catalogue/[slug]/page.tsx` (live API filters)
- [x] CataloguePage/DetailsPage — `797:35810` → `app/catalogue/coin/[id]/page.tsx` (live `getDetails` API)

## Blogs
- [x] BlogsPage — `822:23268` → `app/blogs/page.tsx` (category chips + load more via URL params)
- [x] BlogsPage/Read (article) — `828:40221` → `app/blogs/[slug]/page.tsx` (6 static posts in `lib/blogs.ts`)

## Our other apps
- [x] Our other apps page — `876:23169` → `app/other-apps/page.tsx` ("Explore" → trackzio.com/apps/*, "Get the app" → Google Play; TCG/Vinyl/Birds "Coming soon")

## Identification flow (section `1383:260617`)
- [ ] Home/upload screens — `1384:271196`, `1764:318890`
- [ ] Flow screens — `1385:257835`, `1385:254453`, `1385:257231`, `1385:256844`, `1385:255092`, `1783:32153`, `1385:256563`
- [ ] Flow screens with modal — `1777:325493`, `1781:45466`, `1385:255412`, `1385:256180`

## Not in Figma (from `COINZY-WEB-SPEC.md` Phase 1)
- [ ] Pricing, FAQ, Download, Privacy/Terms — design needed or skip
- [ ] SEO, analytics, deep links (`assetlinks.json`), deploy
