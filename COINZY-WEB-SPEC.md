# Coinzy Web — Technology & Spec Plan

> **Status:** Landing page UI received from Figma — assets exported  
> **Workspace:** `/home/aishik/ReactProjects/Coinzy Web`  
> **Source app:** `/home/aishik/StudioProjects/coin-id-android-frontend/`  
> **Figma:** [Coinzy-webapp — Landing page](https://www.figma.com/design/YV6ArWhD2eVlLPH6M090gc/Coinzy-webapp?node-id=793-76525)  
> **Design assets:** `design/landing-page/`  
> **Last updated:** September 25, 2026

---

## Table of Contents

1. [What Coinzy Is](#1-what-coinzy-is)
2. [Recommended Website Scope (Phased)](#2-recommended-website-scope-phased)
3. [Recommended Tech Stack](#3-recommended-tech-stack)
4. [Site Architecture](#4-site-architecture)
5. [Deep Link Strategy](#5-deep-link-strategy)
6. [Deployment & DevOps](#6-deployment--devops)
7. [Content Spec](#7-content-spec)
8. [What NOT to Build in v1](#8-what-not-to-build-in-v1)
9. [Suggested Build Order](#9-suggested-build-order)
10. [Open Decisions](#10-open-decisions)
11. [Summary Recommendation](#11-summary-recommendation)
12. [Appendix — App Reference Data](#12-appendix--app-reference-data)
13. [Landing Page Design Spec (Figma)](#13-landing-page-design-spec-figma)

---

## 1. What Coinzy Is

**Coinzy** (by **Trackzio**) is an AI-powered coin identification and collector platform.

| Pillar | What it does |
|--------|--------------|
| **Identify** | Snap head/tail photos → AI returns matches with history, rarity, estimated value |
| **Collect** | Owned / Identified / Wishlist collections + custom collections |
| **Catalogue** | Browse global coin database with filters |
| **Marketplace** | Buy & sell coins between collectors |
| **Feed** | Social community (posts, likes, comments) |
| **Experts** | Paid professional appraisal with PDF report |
| **Premium** | Freemium — scan limits on free; unlimited on subscription |

### One-line positioning

> Coinzy is an AI coin scanner and collector app that identifies coins from photos, helps you catalog and value your collection, connect with other collectors, trade on a marketplace, and optionally get certified expert evaluations.

### Existing web footprint today

| Asset | Location / URL |
|-------|----------------|
| Deep-link redirect | `coinzy-dev.web.app` — Firebase Hosting in Android repo `web_redirect/` |
| Legal pages | `trackzio.com` (privacy, terms) |
| Product guide | `docs/coinzy-user-guide.html` in Android repo |
| Backend APIs | `coins-api-prod.trackzio.com` (live) |

### App metadata

| Field | Value |
|-------|-------|
| App name | Coinzy |
| Package | `com.coinzy.trackzio` |
| Publisher | Trackzio |
| Version (Android) | 1.72.0 |
| Play Store | `https://play.google.com/store/apps/details?id=com.coinzy.trackzio` |

---

## 2. Recommended Website Scope (Phased)

Define scope in phases so tech choices stay flexible and v1 can ship quickly.

### Phase 1 — Marketing site (recommended first)

**Primary goal:** Convert visitors → Google Play download.

| Page | Purpose |
|------|---------|
| **Home** | Hero, feature highlights, social proof, download CTA |
| **Features** | AI Identify, Collection, Catalogue, Marketplace, Feed, Experts |
| **Pricing** | Free vs Premium comparison table |
| **How it works** | 3-step flow: Snap → Identify → Collect/Trade |
| **FAQ** | Reuse 18 Q&As from the app's `FAQScreen` |
| **Download** | Smart app-open page (upgrade existing `web_redirect`) |
| **Privacy / Terms** | Link out to `trackzio.com` (or embed later) |

### Phase 2 — Lightweight web experience

Logged-in users can browse without installing the app:

- Global catalogue (read-only)
- Coin detail pages (SEO-friendly `/coins/[slug]`)
- Account login (email + Google)
- Deep-link landing pages that show web preview + "Open in app"

### Phase 3 — Full web app (optional, much larger)

Parity with Android:

- Camera-based identify flow
- Collection CRUD
- Marketplace (list, buy, sell)
- Social feed
- Expert evaluations
- Subscriptions via Stripe

**Recommendation:** Build Phase 1 now with architecture that supports Phase 2 without a rewrite.

---

## 3. Recommended Tech Stack

### 3.1 Core framework

| Choice | Recommendation | Why |
|--------|----------------|-----|
| **Framework** | **Next.js 15 (App Router) + React 19 + TypeScript** | SEO for marketing, static pages, future API routes, image optimization, good Firebase/Vercel deployment |
| **Alternative** | Vite + React Router | Simpler SPA; weaker SEO unless SSR is added separately |

For a product marketing site that may grow into a web app, **Next.js is the better default**.

### 3.2 Styling & UI

| Choice | Recommendation | Why |
|--------|----------------|-----|
| **CSS** | **Tailwind CSS v4** | Fast iteration once UI is ready; maps cleanly to design tokens |
| **Components** | **shadcn/ui** (Radix-based) | Accessible, unstyled base branded with Coinzy tokens |
| **Animation** | **Framer Motion** | Polished marketing scroll/hero animations |
| **Icons** | **Lucide React** | Consistent, lightweight |

### 3.3 Design tokens (from Figma — source of truth for web)

The landing page Figma file defines the web design system. Use these tokens in Tailwind/CSS.

#### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary 500** | `#7C3C3F` | Primary buttons, headings accent, stats numbers |
| **Primary 50** | `#F7E7E8` | Button text on primary, footer headings |
| **Primary 200** | `#D9AEB0` | Footer body text, outline button border |
| **Primary 400** | `#AE6569` | Footer copyright, divider border |
| **Primary 700** | `#662D30` | Footer background |
| **Base Dark** | `#1E1E1F` | Primary text, nav links |
| **Base White** | `#FFFFFF` | Cards, button backgrounds |
| **Neutral 500** | `#606062` | Body/secondary text |
| **Neutral warm** | `#675A54` | Hero paragraph text |
| **Neutral light** | `#746661` | Stats labels |
| **Headline brown** | `#532527` | Hero headline (light weight) |
| **Background cream** | `#FFFCF8` | Nav background, stats card |
| **Background gray** | `#F3F5F7` | Section backgrounds |
| **Border warm** | `#E8DDD6` | Card borders, stats dividers |
| **Border light** | `#E5E7EB` | Nav divider |
| **Outline button bg** | `#FFF9F4` | Secondary CTA background |
| **Outline button border** | `#D9AEB0` | Secondary CTA border |
| **Gold accent** | `#D3AD7A` | Section labels on dark backgrounds |
| **Success green** | `#268823` | "Example collection" badge |
| **Mobile gradient from** | `#3C302E` | Mobile app section card |
| **Mobile gradient to** | `#4A3031` | Mobile app section card |
| **Dark accent** | `#141B34` | Icon strokes |

#### Typography

| Role | Font | Weight | Size | Line height | Usage |
|------|------|--------|------|-------------|-------|
| **Primary UI** | **Geist** | 300–700 | 12–24px | 16–32px | Nav, body, buttons, stats |
| **Hero headline** | **Geist** | 300 / 700 | 36–72px | 40–69px | "One Platform for Every Coin Collector" |
| **Section labels** | Geist | 300 (Light) | 12px | 16px | BROWSE CATALOGUE, MOBILE APP, etc. |
| **H2** | Geist | 600 (SemiBold) | 24px | 32px | Section headings |
| **Body large** | Geist | 400 | 18px | 28px | Hero subtext |
| **Body** | Geist | 400 | 14–16px | 20–24px | Paragraphs, footer links |
| **Button** | Geist | 500 (Medium) | 14px | 20px | CTAs, nav links |
| **Footer brand** | Inter | 600 | 20px | 26px | "Coinzy AI" in footer |
| **Supplementary** | Plus Jakarta Sans | 400 | 14px | 1.5 | Collection card footer text |
| **Logo micro** | Playpen Sans | 600 | 4px | — | AI badge on app icon |

**Google Fonts import (web):**

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@600&family=Plus+Jakarta+Sans:wght@400&display=swap" rel="stylesheet">
```

> **Note:** Geist may need `@fontsource/geist` npm package or Vercel's Geist font CDN if not on Google Fonts. Verify at implementation time.

#### Spacing & layout

| Token | Value | Usage |
|-------|-------|-------|
| Page max width | 1440px | Desktop frame |
| Horizontal padding | 160px | Section side padding |
| Section vertical padding | 140px | Major sections |
| Content max width | 1120px | Inner content area |
| Border radius (button) | 10px | `--borderradius-rounded-box` |
| Border radius (card) | 24px | Feature cards, mobile section |
| Border radius (selector) | 6px | App store badges |
| Border radius (logo) | 8px | App icon in nav |
| Gap (button row) | 12px | Hero CTAs |
| Gap (section) | 32px | Section internal spacing |

#### CSS variables (ready for Tailwind)

```css
:root {
  /* Rustic Wine (Primary) */
  --color-primary-50:  #F7E7E8;
  --color-primary-200: #D9AEB0;
  --color-primary-400: #AE6569;
  --color-primary-500: #7C3C3F;
  --color-primary-700: #662D30;

  /* Base & Neutral */
  --color-ink:         #1E1E1F;
  --color-muted:       #606062;
  --color-muted-warm:  #675A54;
  --color-muted-light: #746661;
  --color-headline:    #532527;
  --color-surface:     #FFFFFF;
  --color-cream:       #FFFCF8;
  --color-bg:          #F3F5F7;
  --color-border:      #E8DDD6;
  --color-border-light:#E5E7EB;
  --color-gold:        #D3AD7A;
  --color-success:     #268823;

  /* Typography */
  --font-primary:   "Geist", system-ui, sans-serif;
  --font-display:   "Geist", system-ui, sans-serif;
  --font-secondary: "Plus Jakarta Sans", sans-serif;
  --font-brand:     "Inter", sans-serif;

  /* Radius */
  --radius-button: 10px;
  --radius-card:   24px;
  --radius-badge:  6px;
  --radius-logo:   8px;
}
```

**Legacy Android tokens** (still valid for app parity, secondary to Figma for web):

| Android token | Hex | Figma equivalent |
|---------------|-----|------------------|
| Gold | `#D5B785` | Used in app; web uses `#D3AD7A` for labels |
| Premium green | `#27665B` | Not prominent on landing page |
| Upsell burgundy | `#7C3C3F` | Same as Primary 500 |

### 3.4 Data & API (Phase 2+)

| Choice | Recommendation | Why |
|--------|----------------|-----|
| **HTTP client** | **Axios** or **fetch + openapi-typescript** | Matches existing REST API style |
| **Server state** | **TanStack Query v5** | Caching, pagination for catalogue/marketplace |
| **Client state** | **Zustand** | Auth session, UI prefs — minimal boilerplate |
| **Validation** | **Zod** | Shared schemas for API responses |

**Existing API base URLs:**

| Service | Production URL |
|---------|----------------|
| Main API | `https://coins-api-prod.trackzio.com/` |
| Dev API | `https://coins-api.trackzio.com/` |
| Experts API | `https://coinzy-experts-api.trackzio.com/` |
| Experts QA | `https://api.coinzy-experts-qa.trackzio.com/` |
| Static assets | `https://progresspal-assets.s3.us-west-2.amazonaws.com/` |
| Notifications | `https://notification-service.trackzio.com` |

### 3.5 Authentication (Phase 2+)

| Method | Web approach |
|--------|--------------|
| Email/password | Same `auth/login`, `auth/signup` endpoints |
| Google | Firebase Auth or Google Identity Services → `auth/social-login/google` |
| Guest | `auth/guest-login` (limited web use) |
| JWT refresh | `auth/refresh-auth-token` — store in httpOnly cookie via Next.js API route |

**Security note:** Do not store JWT in `localStorage` for production. Use httpOnly cookies through a Next.js API proxy.

**Auth endpoints (frozen contract):**

```
POST auth/login
POST auth/signup
POST auth/guest-login
POST auth/social-login/google
POST auth/forgot-password
POST auth/reset-password
GET  auth/refresh-auth-token
GET  auth/me
DELETE auth/me
```

### 3.6 Analytics & marketing

| Tool | Purpose |
|------|---------|
| **Firebase Analytics** (web SDK) | Parity with Android event tracking |
| **Meta Pixel** | Matches Android Facebook SDK attribution |
| **Google Tag Manager** | Flexible conversion tracking |
| **Plausible or GA4** | Optional lightweight web analytics |

**Key events to track:**

- Page views (home, features, pricing, faq)
- Download CTA clicks
- Pricing plan interest
- Expert evaluation interest
- Deep-link open attempts

### 3.7 Payments (web-specific — Phase 3 only)

Android uses **Google Play Billing**. Web cannot reuse that directly.

| Feature | Web solution |
|---------|--------------|
| Premium subscription | **Stripe Checkout** + backend webhook |
| Expert credits | Stripe one-time purchase |

This requires backend work — not in scope for Phase 1.

**Premium tiers (from app):**

| Tier | Billing |
|------|---------|
| Monthly | Google Play subscription |
| Yearly | Google Play subscription |
| Lifetime | One-time purchase |

**Free vs Premium feature comparison:**

| Feature | Free | Premium |
|---------|------|---------|
| Coin identifications | Limited (2/day or 30 lifetime) | Unlimited |
| Private collections | Limited | Advanced |
| Collection size | 100 coins | Unlimited |
| Marketplace listings | 5/day | Unlimited |
| Listing validity | 30 days | 90 days |
| Coin of the Day | 1/day | 3 |
| Advanced coin details | Limited | Full |
| Community feed posts | Limited/day | Unlimited |
| Ads | Yes | Ad-free |

### 3.8 Real-time (Phase 3 — Experts feature)

| Tool | Usage |
|------|-------|
| **Socket.io client** | Expert evaluation status updates |
| **Firebase Cloud Messaging** | Web push for report-ready notifications |

The `experts-rn-handoff/` folder in the Android repo has a frozen API contract. Reuse:

- `spec/api.types.ts` — wire types and endpoint map
- `spec/tokens.json` — semantic design tokens
- `spec/copy.en.json` — copy deck

---

## 4. Site Architecture

```
coinzy-web/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages — no auth
│   │   ├── page.tsx              # Home
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── faq/
│   │   └── download/
│   ├── (app)/                    # Phase 2+ authenticated area
│   │   ├── catalogue/
│   │   ├── coins/[id]/
│   │   └── account/
│   ├── api/                      # BFF proxy routes (auth, cookies)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── marketing/                # Hero, FeatureGrid, PricingTable, FAQ
│   ├── ui/                       # shadcn primitives
│   └── shared/                   # Header, Footer, DownloadBanner
├── lib/
│   ├── api/                      # API client, endpoints
│   ├── auth/                     # Session helpers
│   └── analytics/                # Event tracking
├── hooks/
├── types/                        # Shared TS types (from Android models)
├── public/
│   ├── .well-known/              # assetlinks.json (migrate from web_redirect)
│   └── assets/
└── content/                      # FAQ JSON, feature copy (CMS-ready)
```

---

## 5. Deep Link Strategy

Keep existing Android App Links working. Migrate from `web_redirect/` into the Next.js app.

| Route | Behavior |
|-------|----------|
| `/home` | Try `coinzy://home` intent → fallback Play Store |
| `/coinzy` | Try `coinzy://coinzy` intent → fallback Play Store |
| `/collection` | Try `coinzy://collection` intent → fallback Play Store |
| `/marketplace` | Try `coinzy://marketplace` intent → fallback Play Store |
| `/feed` | Try `coinzy://feed` intent → fallback Play Store |
| `/subs` | Try `coinzy://subs` intent → fallback Play Store |
| `/.well-known/assetlinks.json` | Serve from `public/` |
| `/coins/[id]` | Phase 2: SEO coin pages + "Open in app" banner |

**Domain candidates:**

| Environment | Domain |
|-------------|--------|
| Production | `trackzio.com/coinzy` or `coinzy.trackzio.com` |
| Staging | `coinzy-dev.web.app` (existing) |

**Android manifest deep links (already registered):**

```
https://trackzio.com/coinzy
https://coinzy-dev.web.app/home
https://coinzy-dev.web.app/coinzy
https://coinzy-dev.web.app/collection
https://coinzy-dev.web.app/marketplace
https://coinzy-dev.web.app/feed
https://coinzy-dev.web.app/subs
coinzy://home|coinzy|collection|marketplace|feed|subs
```

---

## 6. Deployment & DevOps

| Layer | Recommendation |
|-------|----------------|
| **Hosting** | **Firebase Hosting** (already in use) or **Vercel** |
| **CI/CD** | GitHub Actions — lint, typecheck, build, deploy preview |
| **Environments** | `dev` → coinzy-dev.web.app, `prod` → trackzio.com/coinzy |
| **Env vars** | `.env.local` for API URLs, Firebase config, analytics IDs |
| **Package manager** | **pnpm** (fast, strict) or npm |

**Environment variables (planned):**

```env
# API
NEXT_PUBLIC_API_BASE_URL=https://coins-api-prod.trackzio.com/
NEXT_PUBLIC_EXPERTS_API_URL=https://coinzy-experts-api.trackzio.com/
NEXT_PUBLIC_ASSETS_URL=https://progresspal-assets.s3.us-west-2.amazonaws.com/

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=

# App links
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.coinzy.trackzio
```

---

## 7. Content Spec

Much of the copy already exists in the Android app — reuse it.

### 7.1 Hero copy (from Figma — confirmed)

- **Headline:** One Platform for Every **Coin Collector**
- **Subtext:** Identify coins instantly, manage collections, buy and sell with confidence, get expert evaluations, and connect with collectors - all in one platform.
- **Primary CTA:** Try Coinzy AI
- **Secondary CTA:** Get the app

Alternative taglines (from Android app, not used in current Figma):

1. *Identify any coin instantly with AI*
2. *Snap a coin. Know its story, rarity, and value.*
3. *Your pocket numismatist — scan, collect, trade, connect.*

### 7.2 Onboarding value props (from app)

| # | Headline | Description |
|---|----------|-------------|
| 1 | Identify any coin instantly | Snap or upload a photo; AI identifies the coin in seconds |
| 2 | Learn Its History, Rarity & Value | Discover origin, rarity, and estimated worth |
| 3 | Connect With Collectors Worldwide | Share discoveries and engage with the community |
| 4 | Buy & Sell Coins Safely | Trusted marketplace for collectors |
| 5 | Create Your Private Collection | Personal digital vault for owned coins |

### 7.3 Feature sections (for Features page)

| Section | Key points |
|---------|------------|
| **AI Identification** | Head + tail photo scan, multi-match results, confidence scores, rich coin profiles |
| **Digital Collection** | Owned / Identified / Wishlist tabs, custom collections, stats dashboard |
| **Global Catalogue** | Browse world coins, filter by issuer/year/material/shape, Coin of the Day |
| **Marketplace** | Browse listings, list coins for sale, seller profiles |
| **Community Feed** | Posts, likes, comments, saved posts |
| **Expert Evaluation** | Upload photos, certified PDF report, market value assessment (~₹499/credit) |

### 7.4 Content sources in Android repo

| Content | Source file |
|---------|-------------|
| Hero taglines | Onboarding carousel copy |
| Feature descriptions | `FAQScreen.kt`, onboarding pages |
| Pricing table | Free vs Premium strings |
| FAQ (18 items) | `FAQScreen.kt` |
| Expert evaluation copy | `experts-rn-handoff/spec/copy.en.json` |
| Brand colors/fonts | `Theme.kt`, `coinzy-user-guide.html` |
| Product guide (full) | `docs/coinzy-user-guide.html` |

### 7.5 Legal URLs

| Document | URL |
|----------|-----|
| Privacy Policy | `https://trackzio.com/privacy-policy-coinzy` |
| Terms of Service | `https://trackzio.com/coinzy%3A-terms` |

### 7.6 Target audience

| Segment | Why Coinzy fits |
|---------|-----------------|
| Casual coin finders | "Found a coin? Identify it instantly" — low friction, camera-first |
| Hobbyist collectors | Catalog owned/identified coins, wishlists, custom collections |
| Numismatists | Global catalogue, rarity/value data, expert evaluations |
| Traders / sellers | Marketplace to list and browse coins |
| Community collectors | Feed to share finds, discuss, engage |

---

## 8. What NOT to Build in v1

These belong in Phase 2/3 and should not block the marketing site launch:

- Camera-based identify flow (needs ML pipeline + mobile-quality UX)
- Full marketplace with listing CRUD
- Social feed (Firestore-backed, complex)
- Web subscriptions (needs Stripe + backend work)
- User collection management
- Expert evaluation upload flow
- Real-time notifications

---

## 9. Suggested Build Order

| Step | Task | Phase |
|------|------|-------|
| 1 | Scaffold — Next.js + TypeScript + Tailwind + shadcn/ui + brand tokens | 1 |
| 2 | Layout shell — Header, footer, responsive nav (placeholder content) | 1 |
| 3 | Marketing pages — Home, Features, Pricing, FAQ, Download | 1 |
| 4 | SEO — Meta tags, Open Graph, sitemap, structured data (`SoftwareApplication`) | 1 |
| 5 | Analytics — Firebase + download click events | 1 |
| 6 | Deep links — Migrate `web_redirect` + `assetlinks.json` | 1 |
| 7 | Deploy — Firebase Hosting staging | 1 |
| 8 | Implement landing page from Figma (`design/landing-page/`) | 1 |
| 9 | Auth + catalogue browse + coin detail pages | 2 |
| 10 | Stripe subscriptions + full app parity | 3 |

---

## 10. Open Decisions

Decisions needed before or during implementation:

| # | Question | Options |
|---|----------|---------|
| 1 | **Primary domain** | `trackzio.com/coinzy`, `coinzy.trackzio.com`, or other |
| 2 | **Scope for v1** | Marketing site only, or include catalogue browse |
| 3 | **Hosting preference** | Firebase Hosting (existing) vs Vercel |
| 4 | **iOS App Store** | Link to iOS app, or Android-only for now |
| 5 | **CMS** | Static JSON/markdown in repo vs headless CMS (Sanity, Contentful) |
| 6 | **First page to build** | Landing page (`Landing page/opt2`) — Figma received ✓ |

---

## 11. Summary Recommendation

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15 + React 19 + TypeScript** |
| Styling | **Tailwind CSS + shadcn/ui** |
| Fonts | **Geist** (primary) + **Inter** (footer brand) + **Plus Jakarta Sans** (secondary) |
| Phase 1 scope | **Marketing site + smart download/deep links** |
| Hosting | **Firebase Hosting** (extends existing setup) |
| API integration | **Deferred to Phase 2** — scaffold client early |
| Payments | **Stripe** when web subscriptions are needed |

---

## 12. Appendix — App Reference Data

### 12.1 Key Android screens (for reference)

| Module | Screen | Role |
|--------|--------|------|
| Splash | `SplashActivity` | Remote config, guest bootstrap |
| Onboarding | `OnBoardingActivity` | Value prop + auth + subs |
| Home | `HomeScreen` | Dashboard & CTAs |
| Identify | `CameraScreen` | AI scan flow |
| Match results | `CoinMatchScreen` | Top AI matches |
| Coin details | `CoinDetailsScreen` | Full coin profile |
| Collection | `CollectionScreen` | Personal + global browse |
| Marketplace | `MarketPlaceScreen` | Buy/sell |
| Feed | `FeedScreen` | Community |
| Experts | `EvaluationLandingScreen` | Professional appraisal |
| Settings | `SettingScreen` | Account & support |

**Bottom navigation (5 tabs):** Home · Identify · Collection · Marketplace · Feed

### 12.2 Main API endpoints (Phase 2+ reference)

**AI identification:**
```
POST api/ai/identify
POST api/ai/identify-v2
```

**Collections & coins:**
```
POST   api/coin/add
PUT    api/coin/update/{id}
DELETE api/coin/delete/{id}
GET    api/coin/fetchAll
GET    api/coin/getDetails/{id}
GET    api/coin/filteritems
GET    api/coin/stats
POST   api/collections/add
GET    api/collections/fetchAll
GET    api/collections/getDetails/{id}
```

**Global catalogue:**
```
GET  api/archetypes/fetchAll
GET  api/archetypes/getDetails/{id}
POST api/archetypes/wishlist/add
POST api/archetypes/wishlist/remove
GET  api/archetypes/coins-of-the-day
GET  api/archetypes/stats
```

**Marketplace:**
```
GET    api/marketplace/listing/fetchAll
GET    api/marketplace/listing/getDetails/{id}
GET    api/marketplace/listing/filteritems
POST   api/marketplace/sell/private/{id}
POST   api/marketplace/sell/global/{id}
PUT    api/marketplace/listing/update
DELETE api/marketplace/listing/delete
```

### 12.3 Key data models (Phase 2+ reference)

| Model | Key fields |
|-------|------------|
| `CoinData` | name, issuer, year, ruler, material, shape, rarity, estimated price, dimensions, designs, condition, ownership flags, images |
| `CoinDetails` | overview, composition/design, history, rarity, ownership sections |
| `MatchedCoin` | AI match results with confidence |
| `MarketCoin` | listing price, seller, validity |
| `Stats` | collection metrics (identified, owned, wishlisted) |
| `UserResponse` | profile, subscription state |

### 12.4 Third-party integrations (Android — for parity planning)

| Integration | Usage |
|-------------|-------|
| Firebase | Analytics, Crashlytics, FCM, Remote Config, Auth, Firestore, Storage |
| Google Play Billing | Subscriptions + IAP |
| Google Sign-In | OAuth |
| Facebook SDK | App events, install attribution |
| ML Kit | Coin circle detection |
| Socket.io | Real-time expert evaluation updates |
| Room | Local persistence (N/A for web) |

### 12.5 Useful reference files in Android repo

| File | Purpose |
|------|---------|
| `INDEX.md` | Full codebase index |
| `docs/coinzy-user-guide.html` | Product guide with web-ready styling |
| `docs/deep-linking.md` | App Links setup |
| `experts-rn-handoff/` | Expert feature spec (API, tokens, copy) |
| `web_redirect/` | Current deep-link redirect (to migrate) |
| `gradle.properties` | All API URLs and config |
| `presentation/theme/Theme.kt` | Brand colors and fonts |

---

## 13. Landing Page Design Spec (Figma)

### 13.1 Source

| Field | Value |
|-------|-------|
| Figma file | [Coinzy-webapp](https://www.figma.com/design/YV6ArWhD2eVlLPH6M090gc/Coinzy-webapp?node-id=793-76525) |
| Canvas | `⌥ Landing page 🟢` (node `793:76525`) |
| Implemented frame | `Landing page/opt2` (node `1050:196584`, 1440×6799) |
| Assets folder | `design/landing-page/` |
| Asset manifest | `design/landing-page/README.md` |

### 13.2 Page sections (implementation order)

1. **Top Nav** — Logo + "Coinzy AI" / "AI Coin Identifier", links (Identify, Marketplace, Catalogue, Blogs, Our other apps ▾), Get app + Try Coinzy AI
2. **Hero** — Parchment texture background, headline, dual CTAs, decorative coin ring (coin image from API at runtime)
3. **Identify Demo** — Left: headline repeat + CTAs; Right: identification result card UI (coin thumbnails from API)
4. **Stats Bar** — 500M+ / 4.8★ / 2M+ / 50K+ in a horizontal row
5. **Browse Catalogue** — 4 category cards with illustrations (coin slot from API)
6. **Features** — Multi-feature grid section (node `1696:195200`)
7. **Mobile App** — Dark gradient card, phone mockups, App Store + Google Play badges, secondary stats row
8. **CTA — Collection** — "Save coins to your collection" with example collection card (coin row from API)
9. **Expert Evaluation** — Expert copy + sample report card + appraiser avatars
10. **Community Feed** — 3 post cards (header images from API)
11. **Footer** — Wine-red background, 4 columns, app badges, social links

### 13.3 Component patterns

| Component | Style |
|-----------|-------|
| **Solid Button** | `bg #7C3C3F`, text `#F7E7E8`, radius 10px, padding 12px 16px, Geist Medium 14px |
| **Outline Button** | `bg #FFF9F4`, border `#D9AEB0`, text `#7C3C3F` |
| **Link Button** | Text `#7C3C3F`, optional arrow-right icon, no background |
| **Section Label** | Geist Light 12px, uppercase tracking, color `#7C3C3F` or `#D3AD7A` on dark |
| **Card** | White bg, border `#E8DDD5`, radius 24px, padding 25px |
| **Stats cell** | Number in `#7C3C3F` SemiBold 24px, label in `#746661` Light 14px |

### 13.4 Dynamic vs static assets

| Static (downloaded) | Dynamic (API) |
|---------------------|---------------|
| Background textures | Coin photos in hero, identify card, catalogue |
| Logo, icons, SVGs | Recent scans thumbnails |
| Phone mockups | Category card coin slots |
| App store badges | CTA collection coin row |
| Expert avatars | Feed post images |
| Category illustrations | Expert report sample coin |

### 13.5 Nav structure (from Figma)

```
Identify | Marketplace | Catalogue | Blogs | Our other apps ▾     [Get app] [Try Coinzy AI]
```

### 13.6 Footer structure (from Figma)

| Column | Links |
|--------|-------|
| Brand | Coinzy AI + tagline |
| Pages | Marketplace, Catalogue, Blogs, Other Apps |
| Company | About, Privacy Policies, Terms & Conditions |
| Download | App Store + Google Play badges |

Social: GitHub, Facebook, Twitter, Google  
Copyright: ©2025 Coinzy AI/Trackzio

---

*Next step: Scaffold Next.js project and implement landing page section by section using `design/landing-page/` assets.*
