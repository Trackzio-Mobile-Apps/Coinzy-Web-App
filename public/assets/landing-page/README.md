# Coinzy Landing Page — Design Assets

> **Figma source:** [Coinzy-webapp — Landing page](https://www.figma.com/design/YV6ArWhD2eVlLPH6M090gc/Coinzy-webapp?node-id=793-76525)  
> **Frame implemented:** `Landing page/opt2` (node `1050:196584`, 1440×6799)  
> **Downloaded:** September 25, 2026

---

## Folder Structure

```
design/landing-page/
├── README.md                    ← this file
├── exports/                     ← full section screenshots (reference only)
├── 01-top-nav/
├── 02-hero/
├── 03-identify-demo/            ← UI-only; coin photos from API
├── 04-stats/                    ← text-only section, no assets
├── 05-browse-catalogue/
├── 06-features/
├── 07-mobile-app/
├── 08-cta/
├── 09-expert-evaluation/
├── 10-community/                ← feed coin images from API
├── 11-footer/
├── icons/shared/
└── excluded-coin-images/        ← intentionally not downloaded
```

---

## Landing Page Sections (top → bottom)

| # | Section | Figma node | Assets folder | Notes |
|---|---------|------------|---------------|-------|
| 1 | **Top Nav** | `1050:196586` | `01-top-nav/` | Logo, nav links, Get app / Try Coinzy AI |
| 2 | **Hero** | `1643:63376` | `02-hero/` | Headline, CTAs, parchment background |
| 3 | **Identify Demo** | `1050:196588` | `03-identify-demo/` | Card UI only — coin thumbnails from API |
| 4 | **Stats Bar** | `1050:196671` | `04-stats/` | 500M+ downloads, 4.8★, 2M+ identified, 50K+ collectors |
| 5 | **Browse Catalogue** | `1050:196692` | `05-browse-catalogue/` | Category cards — coin slot from API |
| 6 | **Features** | `1696:195200` | `06-features/` | Feature grid with icons |
| 7 | **Mobile App** | `1050:197634` | `07-mobile-app/` | Phone mockups, app store badges |
| 8 | **CTA — Collection** | `1696:195398` | `08-cta/` | Example collection — coin images from API |
| 9 | **Expert Evaluation** | `1050:197501` | `09-expert-evaluation/` | Appraiser avatars; sample coin from API |
| 10 | **Community Feed** | `1705:195494` | `10-community/` | Post cards — feed images from API |
| 11 | **Footer** | `1229:41179` | `11-footer/` | Links, app badges, social icons |

---

## Excluded Assets (use API instead)

These were **intentionally not downloaded** — load dynamically from the Coinzy API:

| Location | What's excluded |
|----------|-----------------|
| Hero decorative coin | `image 3059` / `image 3066` |
| Identify demo card | Main coin thumbnail, recent scan thumbnails |
| Category cards | `Coin` slot in each card (`image 3064`–`3066`) |
| CTA collection row | 6 example coin thumbnails |
| Expert evaluation | Sample report coin photo (`image 4`) |
| Community feed | Post header coin/banknote photos |

---

## Key Copy (from Figma)

### Hero
- **Headline:** One Platform for Every **Coin Collector**
- **Subtext:** Identify coins instantly, manage collections, buy and sell with confidence, get expert evaluations, and connect with collectors - all in one platform.
- **CTA primary:** Try Coinzy AI
- **CTA secondary:** Get the app

### Stats
- 500M+ Downloads · 4.8★ App rating · 2M+ Coins identified · 50K+ Active collectors

### Browse Catalogue
- **Label:** BROWSE CATALOGUE
- **Heading:** Browse coins by category
- **Subtext:** Explore popular collecting categories, from ancient to modern.

### Mobile App
- **Label:** MOBILE APP
- **Heading:** Coinzy on the go
- **Subtext:** Identify coins using your camera. Your collection syncs across devices.

### Expert Evaluation
- **Label:** EXPERT EVALUATION
- **Heading:** Not sure about the value? Ask a human expert.
- **Subtext:** Upload your coin and get expert guidance on value, rarity, and condition.

### Community
- **Label:** COMMUNITY
- **Heading:** From the Coinzy feed

### Footer
- Coin valuation, identification, and marketplace platform for collectors worldwide.
- ©2025 Coinzy AI/Trackzio

---

## Usage in Code

When implementing, reference assets via:

```tsx
import heroBg from '@/design/landing-page/02-hero/background-texture-layer-1.png';
// or copy to public/assets/ during build setup
```

Section exports in `exports/` are for visual QA only — do not use as production images.
